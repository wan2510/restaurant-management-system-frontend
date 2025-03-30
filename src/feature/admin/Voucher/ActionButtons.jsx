import React from 'react';
import { Button, Input, Select, DatePicker } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;

const ActionButtons = ({
    onAdd,
    searchText,
    setSearchText,
    setStatusFilter,
    setTypeFilter,
    setCreatedAtFilter,
    setExpiredAtFilter,
}) => {
    return (
        <div className="action-buttons">
            <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
                Thêm Voucher
            </Button>
            <div className="search-container">
                <Select
                    placeholder="Trạng thái"
                    onChange={(value) => setStatusFilter(value || null)}
                    allowClear
                >
                    <Option value="ACTIVE">Khả dụng</Option>
                    <Option value="INACTIVE">Không khả dụng</Option>
                </Select>

                <Select
                    placeholder="Loại voucher"
                    onChange={(value) => setTypeFilter(value || null)}
                    allowClear
                >
                    <Option value="FOR_ALL_USERS">Cho người dùng</Option>
                    <Option value="FOR_NEW_USERS">Cho người mới</Option>
                    <Option value="FOR_VIP_USERS">Cho khách VIP</Option>
                </Select>

                <DatePicker
                    placeholder="Ngày tạo"
                    format="DD/MM/YYYY"
                    onChange={(date) => setCreatedAtFilter(date ? date.toISOString() : null)}
                    allowClear
                />

                <DatePicker
                    placeholder="Ngày hết hạn"
                    format="DD/MM/YYYY"
                    onChange={(date) => setExpiredAtFilter(date ? date.toISOString() : null)}
                    allowClear
                />

                <Search
                    className="search-container"
                    placeholder="Nhập tên voucher"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onSearch={setSearchText}
                    allowClear
                />
            </div>
        </div>
    );
};

export default ActionButtons;