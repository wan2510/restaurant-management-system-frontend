import React, { useEffect } from 'react'; // Import React và useEffect
import { Form, Input, Select, DatePicker, Space } from 'antd'; // Import component Ant Design
import dayjs from 'dayjs'; // Import thư viện ngày giờ

const { Option } = Select; // Lấy Option từ Select

const VoucherForm = ({ form, editingVoucher }) => { // Nhận form và voucher
    useEffect(() => { // Chạy khi editingVoucher/form thay đổi
        console.log('Voucher đang chỉnh sửa:', editingVoucher); // In dữ liệu debug
        if (editingVoucher) { // Nếu chỉnh sửa
            form.setFieldsValue({ // Điền dữ liệu cũ
                id: editingVoucher.id,
                name: editingVoucher.name,
                code: editingVoucher.code,
                discountPercentage: editingVoucher.discountPercentage,
                maxDiscountValue: editingVoucher.maxDiscountValue
                    ? formatMoney(editingVoucher.maxDiscountValue)
                    : '0',
                minOrderValue: editingVoucher.minOrderValue
                    ? formatMoney(editingVoucher.minOrderValue)
                    : '0',
                type: editingVoucher.type,
                status: editingVoucher.status || 'ACTIVE',
                expiredAt: editingVoucher.expiredAt
                    ? dayjs(editingVoucher.expiredAt)
                    : null,
                createdAt: editingVoucher.createdAt
                    ? dayjs(editingVoucher.createdAt)
                    : null,
                updatedAt: editingVoucher.updatedAt
                    ? dayjs(editingVoucher.updatedAt)
                    : null,
            });
        } else { // Nếu tạo mới
            form.resetFields(); // Xóa form
            form.setFieldsValue({ // Giá trị mặc định
                status: 'ACTIVE',
                expiredAt: dayjs()
                    .add(30, 'day')
                    .set('hour', 23)
                    .set('minute', 59)
                    .set('second', 59),
                type: 'FOR_ALL_USERS',
                createdAt: dayjs(),
                updatedAt: dayjs(),
            });
        }
    }, [editingVoucher, form]); // Phụ thuộc editingVoucher và form

    const formatMoney = (value) => { // Định dạng số (VD: 10000 -> 10.000)
        if (!value) return '';
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const formatInt = (value) => { // Chuyển chuỗi thành số (VD: "10.000" -> 10000)
        if (!value) return '';
        const cleanedValue = value.toString().replace(/\./g, '');
        const parsedValue = parseInt(cleanedValue, 10);
        return isNaN(parsedValue) ? '' : parsedValue;
    };

    const handleInputLimit = (field, min, max) => (e) => { // Giới hạn giá trị nhập
        let value = formatInt(e.target.value);
        if (value === '') value = min;
        if (value < min) value = min;
        if (value > max) value = max;
        form.setFieldsValue({ [field]: formatMoney(value) });
    };

    const handleCodeChange = (e) => { // Xử lý mã voucher
        let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        form.setFieldsValue({ code: value });
    };

    const handleExpiredDateChange = (date) => { // Xử lý ngày hết hạn
        if (date) {
            const endOfDay = date
                .set('hour', 23)
                .set('minute', 59)
                .set('second', 59);
            form.setFieldsValue({ expiredAt: endOfDay });
        }
    };

    return ( // Giao diện form
        <Form layout="vertical" form={form}> 
            {/* Các trường ẩn */}
            <Form.Item name="id" hidden> 
                <Input hidden />
            </Form.Item>
            <Form.Item name="createdAt" hidden> 
                <Input hidden />
            </Form.Item>
            <Form.Item name="updatedAt" hidden> 
                <Input hidden />
            </Form.Item>

            {/* Các trường hiển thị */}
            <Form.Item
                name="name"
                label="Tên Voucher"
                rules={[
                    { required: true, message: 'Vui lòng nhập tên voucher!' },
                ]}
            >
                <Input
                    placeholder="Nhập tên voucher"
                    disabled={!!editingVoucher}
                />
            </Form.Item>

            <Form.Item
                name="code"
                label="Mã Voucher"
                rules={[
                    { required: true, message: 'Vui lòng nhập mã voucher!' },
                    {
                        pattern: /^[A-Z0-9]+$/,
                        message: 'Mã chỉ được chứa chữ cái và số, không có khoảng trắng hoặc ký tự đặc biệt!',
                    },
                ]}
            >
                <Input
                    placeholder="Nhập mã voucher"
                    disabled={!!editingVoucher}
                    onChange={handleCodeChange}
                />
            </Form.Item>

            <Form.Item
                name="discountPercentage"
                label="Giảm Giá (%)"
                rules={[
                    {
                        required: true,
                        message: 'Vui lòng nhập phần trăm giảm giá là 1 giá trị nguyên!',
                    },
                ]}
            >
                <Input
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    placeholder="Nhập phần trăm giảm giá"
                    onBlur={handleInputLimit('discountPercentage', 0, 100)}
                />
            </Form.Item>

            <Form.Item
                name="maxDiscountValue"
                label="Giảm Tối Đa (VNĐ)"
                rules={[
                    {
                        required: true,
                        message: 'Vui lòng nhập giá giảm tối đa!',
                    },
                    () => ({
                        validator(_, value) {
                            const numericValue = parseFloat(
                                value.replace(/\./g, ''),
                            );
                            if (numericValue < 10000) {
                                return Promise.reject(
                                    new Error(
                                        'Giá giảm tối đa phải ít nhất là 10,000 VNĐ!',
                                    ),
                                );
                            }
                            return Promise.resolve();
                        },
                    }),
                ]}
            >
                <Input
                    type="text"
                    placeholder="Nhập giá giảm tối đa"
                    onBlur={handleInputLimit('maxDiscountValue',10000, 10000000)}
                />
            </Form.Item>

            <Form.Item
                name="minOrderValue"
                label="Mức Tối Thiểu (VNĐ)"
                rules={[
                    { required: true, message: 'Vui lòng nhập giá tối thiểu!' },
                    () => ({
                        validator(_, value) {
                            const numericValue = parseFloat(
                                value.replace(/\./g, ''),
                            );
                            if (numericValue < 0) {
                                return Promise.reject(
                                    new Error(
                                        'Giá tối thiểu phải lớn hơn 0,000 VNĐ!',
                                    ),
                                );
                            }
                            return Promise.resolve();
                        },
                    }),
                ]}
            >
                <Input
                    type="text"
                    placeholder="Nhập giá tối thiểu"
                    onBlur={handleInputLimit('minOrderValue', 0, 10000000)}
                />
            </Form.Item>

            <Form.Item
                name="type"
                label="Loại Voucher"
                rules={[
                    { required: true, message: 'Vui lòng chọn loại voucher!' },
                ]}
            >
                <Select placeholder="Chọn loại voucher">
                    <Option value="FOR_ALL_USERS">Cho người dùng</Option>
                    <Option value="FOR_NEW_USERS">Cho người mới</Option>
                    <Option value="FOR_VIP_USERS">Cho khách VIP</Option>
                </Select>
            </Form.Item>

            <Space style={{ display: 'flex', width: '100%' }}>
                <Form.Item
                    name="expiredAt"
                    label="Ngày Hết Hạn"
                    style={{ width: '100%' }}
                    rules={[
                        {
                            required: true,
                            message: 'Vui lòng chọn ngày hết hạn!',
                        },
                        () => ({
                            validator(_, value) {
                                const minAllowedDate = dayjs();
                                if (value && value.isBefore(minAllowedDate)) {
                                    return Promise.reject(
                                        new Error(
                                            'Voucher phải được sử dụng ít nhất 1 ngày!',
                                        ),
                                    );
                                }
                                return Promise.resolve();
                            },
                        }),
                    ]}
                >
                    <DatePicker
                        format="DD/MM/YYYY"
                        onChange={handleExpiredDateChange}
                        disabledDate={(current) => {
                            const minAllowedDate = dayjs();
                            return current && current < minAllowedDate;
                        }}
                    />
                </Form.Item>
            </Space>

            {editingVoucher && (
                <Form.Item name="status" label="Trạng Thái">
                    <Select>
                        <Option value="ACTIVE">Khả dụng</Option>
                        <Option value="INACTIVE">Không khả dụng</Option>
                    </Select>
                </Form.Item>
            )}
        </Form>
    );
};

export default VoucherForm; // Xuất component