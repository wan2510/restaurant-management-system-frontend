import { Layout, Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Outlet, useNavigate } from "react-router-dom";

const { Header, Content } = Layout;

const FullScreenOrderLayout = () => {
  const navigate = useNavigate();

  const handleBackToAdmin = () => {
    navigate("/admin");
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#fff" }}>
      {/* Header cố định */}
      <Header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: "#fff",
          borderBottom: "1px solid #e8e8e8",
          padding: "0 1rem",
          height: "64px",
          lineHeight: "64px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={handleBackToAdmin}
          style={{
            fontSize: "14px", // Đồng nhất font-size
            color: "#1890ff", // Đồng nhất màu chữ
          }}
        >
          Quay lại trang quản lý
        </Button>
      </Header>

      {/* Content với padding-top để tránh bị che bởi header */}
      <Content
        style={{
          padding: "1rem",
          marginTop: "64px", // Đảm bảo không bị che bởi header
          background: "#fff",
          minHeight: "calc(100vh - 64px)", // Trừ chiều cao của header
        }}
      >
        <Outlet />
      </Content>
    </Layout>
  );
};

export default FullScreenOrderLayout;