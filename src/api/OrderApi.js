import { message } from 'antd';

// Đường dẫn API cơ bản
const API_URL = 'http://localhost:8080/api';
const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
};

// Lấy token từ localStorage
const getAccessToken = () => {
    const token = localStorage.getItem('accessToken');
    return token ? `Bearer ${token}` : null;
};

// Trạng thái đơn hàng
let orderState = {
    bill: [],              // Danh sách món trong hóa đơn
    selectedTable: null,   // Bàn được chọn
    selectedVoucher: null, // Voucher được chọn
    paymentMethod: 'Tiền mặt', // Phương thức thanh toán
    cashReceived: 0,       // Số tiền mặt nhận được
    isPaymentModalOpen: false, // Trạng thái modal thanh toán
};

// Quản lý các hàm theo dõi trạng thái
const subscribers = new Set();

// Đăng ký theo dõi trạng thái
export const subscribe = (listener) => {
    subscribers.add(listener);
    listener(orderState);
    return () => subscribers.delete(listener);
};

// Cập nhật trạng thái
export const setState = (newState) => {
    orderState = { ...orderState, ...newState };
    console.log("New orderState:", orderState);
    subscribers.forEach((listener) => listener(orderState));
};

// Lấy trạng thái hiện tại
export const getState = () => {
    return { ...orderState };
};

// Lấy danh sách bàn từ API
export const getTables = async () => {
    try {
        const token = getAccessToken();
        const headersWithToken = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(token ? { Authorization: token } : {}),
        };
        const response = await fetch(`${API_URL}/table_restaurant`, {
            method: 'GET',
            headers: headersWithToken,
        });
        if (!response.ok) throw new Error('Failed to fetch tables');
        const data = await response.json();
        console.log('Tables from server:', data);

        return data.map((table) => ({
            id: table.id,
            number: table.tableNumber,
            max_number_human: table.capacity,
            bookedGuests: table.bookedGuests,
            status: table.status,
            type: table.type,
        }));
    } catch (error) {
        console.error('Error fetching tables:', error);
        message.error('Không thể tải danh sách bàn!');
        throw error;
    }
};

// Lấy danh sách món ăn từ API
export const getMenuItems = async () => {
    try {
        const token = getAccessToken();
        const headersWithToken = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(token ? { Authorization: token } : {}),
        };
        const response = await fetch(`${API_URL}/food`, {
            method: 'GET',
            headers: headersWithToken,
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        console.log('Foods from server:', data);

        return data.map((item) => ({
            id: item.uuid,
            name: item.name,
            price: item.price,
            image: item.imageUrl || '',
            category: item.categoryName || 'Không có danh mục',
            description: item.description || 'Không có mô tả',
        }));
    } catch (error) {
        console.error('Error fetching foods:', error);
        message.error('Không thể tải danh sách món ăn!');
        throw error;
    }
};

// Lấy danh sách danh mục món ăn từ API
export const getFoodCategories = async () => {
    try {
        const token = getAccessToken();
        const headersWithToken = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(token ? { Authorization: token } : {}),
        };
        const response = await fetch(`${API_URL}/category`, {
            method: 'GET',
            headers: headersWithToken,
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        console.log('Categories from server:', data);

        return data.map((category) => ({
            id: category.uuid,
            name: category.name,
            description: category.description || 'Không có mô tả',
        }));
    } catch (error) {
        console.error('Error fetching categories:', error);
        message.error('Không thể tải danh mục món ăn!');
        throw error;
    }
};

// Lấy danh sách voucher từ API
export const getVouchers = async () => {
    try {
        const token = getAccessToken();
        const headersWithToken = {
            'Content-Type': 'application/json',
            credentials: 'include',
            ...(token ? { Authorization: token } : {}),
        };
        const response = await fetch(`${API_URL}/voucher/getListVoucher`, {
            method: 'GET',
            headers: headersWithToken,
        });
        if (!response.ok) throw new Error('Failed to fetch vouchers');
        const data = await response.json();
        console.log('Vouchers from server:', data);

        return data.map((voucher) => ({
            id: voucher.id,
            code: voucher.code,
            name: voucher.name,
            discount: voucher.discountPercentage,
            max_discount_value: voucher.maxDiscountValue,
            min_order_value: voucher.minOrderValue,
            status: voucher.status,
            type: voucher.type,
        }));
    } catch (error) {
        console.error('Error fetching vouchers:', error);
        message.error('Không thể tải danh sách voucher!');
        throw error;
    }
};

// Thêm món vào hóa đơn
export const addToBill = async (item) => {
    try {
        if (!item || !item.id || !item.name || !item.price) {
            message.error('Dữ liệu món ăn không hợp lệ!');
            return { success: false };
        }
        const existingItem = orderState.bill.find((i) => i.id === item.id);
        const newBill = existingItem
            ? orderState.bill.map((i) =>
                  i.id === item.id
                      ? { ...i, quantity: Math.min(i.quantity + 1, 50) }
                      : i
              )
            : [...orderState.bill, { ...item, quantity: 1 }];
        setState({ bill: newBill });
        return { success: true, bill: newBill };
    } catch (error) {
        console.error('Error adding to bill:', error);
        return { success: false, error };
    }
};

// Chọn bàn
export const setSelectedTable = async (tableNumber) => {
    try {
        const tables = await getTables();
        const table = tables.find((t) => t.number === tableNumber);

        if (table) {
            if (table.status !== 'available') { // Sửa thành 'available' chữ thường
                message.error(`Bàn ${tableNumber} hiện không khả dụng!`);
                return { success: false, error: 'Table not available' };
            }
            setState({ selectedTable: table.number });
            return { success: true, selectedTable: table.number };
        } else {
            message.error(`Không tìm thấy bàn số ${tableNumber}!`);
            return { success: false, error: 'Table not found' };
        }
    } catch (error) {
        console.error('Error setting table:', error);
        message.error('Lỗi khi chọn bàn!');
        return { success: false, error: error.message };
    }
};

// Chọn voucher
export const setSelectedVoucher = async (voucher) => {
    try {
        const totalPrice = getTotalPrice();
        if (voucher && totalPrice < voucher.min_order_value) {
            message.warning(
                `Đơn hàng phải từ ${voucher.min_order_value.toLocaleString()} VND để áp dụng voucher này!`
            );
            setState({ selectedVoucher: null });
            return { success: false, selectedVoucher: null };
        }
        setState({ selectedVoucher: voucher || null });
        return { success: true, selectedVoucher: voucher || null };
    } catch (error) {
        console.error('Error setting voucher:', error);
        return { success: false, error };
    }
};

// Cập nhật số lượng món hoặc xóa món
export const updateItem = async (id, quantity) => {
    try {
        if (quantity < 0) {
            message.error('Số lượng không thể âm!');
            return { success: false };
        }
        if (quantity > 50) {
            message.error('Số lượng tối đa cho mỗi món là 50!');
            return { success: false };
        }
        const newBill =
            quantity === 0
                ? orderState.bill.filter((item) => item.id !== id)
                : orderState.bill.map((item) =>
                      item.id === id ? { ...item, quantity } : item
                  );
        setState({ bill: newBill });
        return { success: true, bill: newBill };
    } catch (error) {
        console.error('Error updating item:', error);
        return { success: false, error };
    }
};

// Chọn phương thức thanh toán
export const setPaymentMethod = async (method) => {
    try {
        if (method !== 'Tiền mặt' && method !== 'Chuyển khoản') {
            message.error('Phương thức thanh toán không hợp lệ!');
            return { success: false };
        }
        setState({ paymentMethod: method });
        return { success: true, paymentMethod: method };
    } catch (error) {
        console.error('Error setting payment method:', error);
        return { success: false, error };
    }
};

// Cập nhật số tiền mặt nhận được
export const setCashReceived = async (amount) => {
    try {
        if (amount < 0) {
            message.error('Số tiền không thể âm!');
            return { success: false };
        }
        setState({ cashReceived: amount });
        return { success: true, cashReceived: amount };
    } catch (error) {
        console.error('Error setting cash received:', error);
        return { success: false, error };
    }
};

// Tính tổng giá hóa đơn
export const getTotalPrice = () => {
    return orderState.bill.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );
};

// Tính số tiền giảm giá
export const getDiscount = () => {
    const totalPrice = getTotalPrice();
    if (
        orderState.selectedVoucher &&
        totalPrice >= orderState.selectedVoucher.min_order_value
    ) {
        const discountAmount =
            (totalPrice * orderState.selectedVoucher.discount) / 100;
        return Math.min(
            discountAmount,
            orderState.selectedVoucher.max_discount_value
        );
    }
    return 0;
};

// Tính giá cuối cùng sau giảm giá
export const getFinalPrice = () => {
    return getTotalPrice() - getDiscount();
};

// Kiểm tra trước khi tạo hóa đơn
export const validateBeforeCreate = async () => {
    try {
        if (!orderState.selectedTable) {
            message.error('Vui lòng chọn bàn trước khi tạo hóa đơn!');
            return { success: false, error: 'No table selected' };
        }
        if (orderState.bill.length === 0) {
            message.error('Chưa có món nào trong hóa đơn!');
            return { success: false, error: 'Empty bill' };
        }
        const tables = await getTables();
        const selectedTableData = tables.find(
            (table) => table.number === orderState.selectedTable
        );
        if (!selectedTableData) {
            message.error(`Bàn ${orderState.selectedTable} không tồn tại!`);
            return { success: false, error: 'Table not found' };
        }
        if (selectedTableData.status !== 'available') { // Sửa thành 'available' chữ thường
            message.error(`Bàn ${orderState.selectedTable} hiện không khả dụng!`);
            return { 
                success: false, 
                error: 'Table not available',
                tableStatus: selectedTableData.status 
            };
        }
        return { success: true, tableData: selectedTableData };
    } catch (error) {
        console.error('Error validating before create:', error);
        message.error('Lỗi khi kiểm tra thông tin đặt bàn!');
        return { success: false, error: error.message || 'Validation failed' };
    }
};