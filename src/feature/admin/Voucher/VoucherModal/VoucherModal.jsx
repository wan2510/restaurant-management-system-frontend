import React from "react"; // Import React
import { Modal, Form } from "antd"; // Import Modal và Form từ Ant Design
import VoucherForm from "./VoucherForm"; // Import component VoucherForm

const VoucherModal = ({ visible, onClose, onSave, form, editingVoucher }) => { // Nhận các props: trạng thái hiển thị, đóng, lưu, form, và voucher
  return (
    <Modal
      title={editingVoucher ? "Chỉnh Sửa Voucher" : "Thêm Voucher"} // Tiêu đề: "Chỉnh sửa" nếu có voucher, "Thêm" nếu không
      open={visible} // Modal mở hay đóng
      onCancel={onClose} // Gọi hàm đóng khi nhấn Hủy
      onOk={onSave} // Gọi hàm lưu khi nhấn Đồng ý
      // Đổi cách hiện thị nút
      okText="Đồng ý"
      cancelText="Hủy" 
    >
      <VoucherForm form={form} editingVoucher={editingVoucher} /> // Hiển thị form voucher
    </Modal>
  );
};

export default VoucherModal; // Xuất component