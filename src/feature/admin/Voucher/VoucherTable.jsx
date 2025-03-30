import React from 'react';
import { Table, Space, Button, Tag, Select, message, Popconfirm } from 'antd';
import dayjs from 'dayjs';
import { updateVoucher } from '../../../api/VoucherApi';

const { Option } = Select;

const VoucherTable = ({ vouchers, onEdit, loading, onUpdate }) => {
    const formatMoney = (value) => {
        if (!value) return '0';
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const formatDateTime = (date) => {
        if (!date) return null;
        return dayjs(date).format('YYYY-MM-DDTHH:mm:ss');
    };

    const handleFieldChange = async (record, field, value) => {
        if (record[field] === value) {
            message.info('Dữ liệu không thay đổi so với bản gốc!');
            return;
        }

        const updatedData = {
            id: record.id,
            name: record.name,
            code: record.code,
            discountPercentage: record.discountPercentage,
            maxDiscountValue: record.maxDiscountValue,
            minOrderValue: record.minOrderValue,
            type: field === 'type' ? value : record.type,
            status: field === 'status' ? value : record.status,
            expiredAt: formatDateTime(record.expiredAt),
            createdAt: formatDateTime(record.createdAt),
            updatedAt: formatDateTime(new Date()), // Cập nhật thời gian hiện tại
            deletedAt: record.deletedAt ? formatDateTime(record.deletedAt) : null,
        };

        try {
            await updateVoucher(updatedData);
            message.success(`Cập nhật ${field === 'status' ? 'trạng thái' : 'loại'} thành công!`);
            onUpdate();
        } catch (error) {
            message.error(`Cập nhật ${field === 'status' ? 'trạng thái' : 'loại'} thất bại!`);
            console.error('Lỗi khi cập nhật:', error);
        }
    };

    const handleSoftDelete = async (voucher) => {
        try {
            const updatedVoucher = {
                id: voucher.id,
                name: voucher.name,
                code: voucher.code,
                discountPercentage: voucher.discountPercentage,
                maxDiscountValue: voucher.maxDiscountValue,
                minOrderValue: voucher.minOrderValue,
                type: voucher.type,
                status: voucher.status,
                expiredAt: formatDateTime(voucher.expiredAt),
                createdAt: formatDateTime(voucher.createdAt),
                updatedAt: formatDateTime(voucher.updatedAt),
                deletedAt: formatDateTime(new Date()), // Cập nhật deletedAt thành thời gian hiện tại
            };
            console.log('Dữ liệu gửi đi (soft delete):', updatedVoucher);
            await updateVoucher(updatedVoucher);
            message.success('Xóa voucher thành công!');
            onUpdate();
        } catch (error) {
            message.error('Xóa voucher thất bại!');
            console.error('Lỗi khi xóa voucher:', error);
        }
    };

    const columns = [
        {
            title: <strong>Mã Voucher</strong>,
            dataIndex: 'code',
            key: 'code',
            sorter: (a, b) => a.code.localeCompare(b.code),
        },
        {
            title: <strong>Tên Voucher</strong>,
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: <strong>Giảm Giá (%)</strong>,
            dataIndex: 'discountPercentage',
            key: 'discountPercentage',
            sorter: (a, b) => Number(a.discountPercentage) - Number(b.discountPercentage),
        },
        {
            title: <strong>Giảm Tối Đa (VNĐ)</strong>,
            dataIndex: 'maxDiscountValue',
            key: 'maxDiscountValue',
            render: (value) => formatMoney(value),
            sorter: (a, b) => Number(a.maxDiscountValue) - Number(b.maxDiscountValue),
        },
        {
            title: <strong>Mức Tối Thiểu (VNĐ)</strong>,
            dataIndex: 'minOrderValue',
            key: 'minOrderValue',
            render: (value) => formatMoney(value),
            sorter: (a, b) => Number(a.minOrderValue) - Number(b.minOrderValue),
        },
        {
            title: <strong>Ngày Tạo</strong>,
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text) => {
                let displayCreateAt;
                displayCreateAt = text ? dayjs(text, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY') : 'N/A';
                return displayCreateAt;
            },
            sorter: (a, b) => dayjs(a.createdAt, 'YYYY-MM-DD HH:mm:ss').unix() - dayjs(b.createdAt, 'YYYY-MM-DD HH:mm:ss').unix(),
        },
        {
            title: <strong>Ngày Hết Hạn</strong>,
            dataIndex: 'expiredAt',
            key: 'expiredAt',
            render: (text) => {
                let displayExpiredAt;
                displayExpiredAt = text ? dayjs(text, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY') : 'N/A';
                return displayExpiredAt;
            },
            sorter: (a, b) => dayjs(a.expiredAt, 'YYYY-MM-DD HH:mm:ss').unix() - dayjs(b.expiredAt, 'YYYY-MM-DD HH:mm:ss').unix(),
        },
        {
            title: <strong>Loại</strong>,
            dataIndex: 'type',
            key: 'type',
            sorter: (a, b) => a.type.localeCompare(b.type),
            render: (type, record) => (
                <Select
                    value={type}
                    style={{ width: 150 }}
                    onChange={(value) => handleFieldChange(record, 'type', value)}
                >
                    <Option value="FOR_ALL_USERS">Cho người dùng</Option>
                    <Option value="FOR_NEW_USERS">Cho người mới</Option>
                    <Option value="FOR_VIP_USERS">Cho khách VIP</Option>
                </Select>
            ),
        },
        {
            title: <strong>Trạng Thái</strong>,
            dataIndex: 'status',
            key: 'status',
            render: (status, record) => (
                <Select
                    value={status}
                    style={{ width: 150 }}
                    onChange={(value) => handleFieldChange(record, 'status', value)}
                >
                    <Option value="ACTIVE">Khả dụng</Option>
                    <Option value="INACTIVE">Không khả dụng</Option>
                </Select>
            ),
            sorter: (a, b) => a.status.localeCompare(b.status),
        },
        {
            title: <strong>Thao Tác</strong>,
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button type="primary" onClick={() => onEdit(record)}>
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc muốn xóa voucher này không?"
                        onConfirm={() => handleSoftDelete(record)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button type="danger" className="delete-button">
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Table
            dataSource={vouchers}
            columns={columns}
            rowKey="id"
            bordered
            pagination={{ pageSize: 7 }}
            loading={loading}
        />
    );
};

export default VoucherTable;