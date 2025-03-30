import React, { useState, useEffect } from "react";
import { Row, Col, Layout, Typography, Card, Button, message } from "antd";
import HandleOrderFood from "./handleOrderFood/HandleOrderFood";
import ModalPurchase from "./modalPurchase/ModalPurchase";
import ModalBill from "./modalBill/ModalBill";
import {
  getState,
  subscribe,
  getMenuItems,
  getFoodCategories,
  getTables,
  getVouchers,
  addToBill,
  updateItem,
  setSelectedTable,
  setSelectedVoucher,
  setPaymentMethod,
  setCashReceived,
  validateBeforeCreate,
  getTotalPrice,
  getDiscount,
  getFinalPrice,
  setState,
} from "../../../api/OrderApi";
import "./Order.css";

const { Content } = Layout;
const { Title } = Typography;

const Order = ({ user }) => {
  const [state, setLocalState] = useState(getState());
  const [menuItems, setMenuItems] = useState([]);
  const [foodCategories, setFoodCategories] = useState([]);
  const [tables, setTables] = useState([]);
  const [vouchers, setVouchers] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribe((newState) => {
      console.log("State updated in Order:", newState);
      setLocalState(newState);
    });

    const fetchInitialData = async () => {
      try {
        const [menuItemsData, foodCategoriesData, tablesData, vouchersData] = await Promise.all([
          getMenuItems(),
          getFoodCategories(),
          getTables(),
          getVouchers(),
        ]);
        setMenuItems(menuItemsData);
        setFoodCategories(foodCategoriesData);
        setTables(tablesData);
        setVouchers(vouchersData);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        message.error("Không thể tải dữ liệu ban đầu!");
      }
    };

    fetchInitialData();

    return unsubscribe;
  }, []);

  const clearOrder = async () => {
    setState({
      bill: [],
      selectedTable: null,
      selectedVoucher: null,
      paymentMethod: "Tiền mặt", 
      cashReceived: 0,
      isPaymentModalOpen: false,
    });
  };

  const handleCreateBill = async () => {
    const validation = await validateBeforeCreate();
    if (validation.success) {
      console.log("Opening payment modal");
      setState({ isPaymentModalOpen: true });
    } else {
      console.log("Validation failed");
      message.error("Không thể tạo hóa đơn!");
    }
  };

  const handleConfirmPayment = async (order) => {
    const totalPrice = getTotalPrice();
    const discount = getDiscount();
    const finalPrice = getFinalPrice();

    let paymentMessage = "";

    if (state.paymentMethod === "Tiền mặt") {
      if (state.cashReceived < finalPrice) {
        message.error("Số tiền khách đưa không đủ để thanh toán!");
        return;
      }
      const change = state.cashReceived - finalPrice;
      paymentMessage = `Hóa đơn đã được tạo thành công!\nPhương thức: Tiền mặt\nSố tiền: ${finalPrice.toLocaleString("vi-VN")} VND\nTiền khách đưa: ${state.cashReceived.toLocaleString("vi-VN")} VND\nTiền thừa: ${change.toLocaleString("vi-VN")} VND`;
      if (order.note) {
        paymentMessage += `\nGhi chú: ${order.note}`;
      }
    } else {
      paymentMessage = `Hóa đơn đã được tạo thành công!\nPhương thức: Chuyển khoản\nSố tiền: ${finalPrice.toLocaleString("vi-VN")} VND`;
    }

    // Hiển thị thông báo chi tiết
    message.success(paymentMessage);

    // Làm mới toàn bộ phần hóa đơn
    await clearOrder();
  };

  const handleCancelPayment = () => {
    setState({ ...state, isPaymentModalOpen: false });
    message.info("Thanh toán đã bị hủy!");
  };

  return (
    <Layout className="order-page">
      <Content className="order-content">
        <Row gutter={16} className="order-container">
          <Col span={16}>
            <Card style={{ marginLeft: "1.25vw", marginTop: "2vw" }}>
              <Title level={2}>Menu</Title>
              <HandleOrderFood
                menuItems={menuItems}
                addToBill={addToBill}
                foodCategories={foodCategories}
              />
            </Card>
          </Col>

          <Col span={8}>
            <Card className="bill-container" style={{ margin: "2vw 2vw 0vw 1.25vw" }}>
              <Title level={2}>Hóa đơn</Title>
              <ModalBill
                vouchers={vouchers}
                tables={tables}
                onCreateBill={handleCreateBill}
                userRole={user?.role}
              />
            </Card>
          </Col>
        </Row>
      </Content>

      <ModalPurchase
        visible={state.isPaymentModalOpen}
        onCancel={handleCancelPayment}
        onConfirm={handleConfirmPayment}
        bill={state.bill}
        vouchers={vouchers}
        selectedTable={state.selectedTable}
        selectedVoucher={state.selectedVoucher}
        paymentMethod={state.paymentMethod}
        setPaymentMethod={setPaymentMethod}
        cashReceived={state.cashReceived}
        setCashReceived={setCashReceived}
      />
    </Layout>
  );
};

export default Order;