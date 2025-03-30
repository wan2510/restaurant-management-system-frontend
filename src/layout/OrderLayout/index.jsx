// FullScreenOrderLayout.jsx
import { Layout, Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Outlet, useNavigate } from "react-router-dom";

const { Content } = Layout;

const FullScreenOrderLayout = () => {
  const navigate = useNavigate();

  const handleBackToAdmin = () => {
    navigate("/admin");
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#fff" }}>
      <Content 
        style={{ 
          padding: 24, 
          margin: 0, 
          background: "#fff",
          minHeight: "100vh"
        }}
      >
        <Button 
          type="link" 
          icon={<ArrowLeftOutlined />} 
          onClick={handleBackToAdmin}
          style={{ fontSize: "16px", marginBottom: "16px" }}
        >
          Quay lại trang quản lý
        </Button>
        
        <Outlet />
      </Content>
    </Layout>
  );
};

export default FullScreenOrderLayout;
