import React, { useState, useEffect } from 'react';
import {
    List,
    Button,
    InputNumber,
    Typography,
    Space,
    Card,
    Popconfirm,
} from 'antd';
import HandleSelectTable from './HandleSelectTable';
import HandleSelectVoucher from './HandleSelectVoucher';
import {
    getState,
    subscribe,
    getTotalPrice,
    getDiscount,
    getFinalPrice,
    updateItem,
    setSelectedTable,
    setSelectedVoucher,
} from '../../../../api/OrderApi';

const { Title, Text } = Typography;

const ModalBill = ({ vouchers, tables, onCreateBill, userRole }) => {
    const [orderState, setOrderState] = useState(getState());

    useEffect(() => {
        const unsubscribe = subscribe((newState) => {
            console.log('Received new state in ModalBill:', newState);
            setOrderState(newState);
        });
        return () => unsubscribe();
    }, []);

    const { bill, selectedTable, selectedVoucher } = orderState;

    const totalPrice = getTotalPrice();
    const discount = getDiscount();
    const finalPrice = getFinalPrice();

    console.log('ModalBill - Order State:', orderState);
    console.log('ModalBill - Total Price:', totalPrice);
    console.log('ModalBill - Discount:', discount);
    console.log('ModalBill - Final Price:', finalPrice);

    return (
        <Card
            title={
                <span style={{ fontSize: 18, fontWeight: 500, color: '#333' }}>
                    Chi tiết đơn hàng
                </span>
            }
            style={{
                width: '100%',
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e8e8e8',
            }}
        >
            <Space direction="vertical" style={{ width: '100%' }}>
                <HandleSelectTable
                    tables={tables}
                    selectedTable={selectedTable}
                    setSelectedTable={setSelectedTable}
                />
            <div style={{ maxHeight: '18vw', overflowY: 'auto' }}>
                <List
                    dataSource={bill}
                    locale={{
                        emptyText: (
                            <Text italic style={{ color: '#999' }}>
                                Chưa có món nào trong hóa đơn.
                            </Text>
                        ),
                    }}
                    renderItem={(item) => (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '12px',
                                background: '#f9f9f9',
                                borderRadius: '6px',
                                marginBottom: '10px',
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <div>
                                    <strong>{item.name}</strong>
                                </div>
                                <div
                                    style={{ fontSize: '12px', color: 'gray' }}
                                >
                                    Đơn giá: {item.price.toLocaleString()} VND
                                </div>
                            </div>

                            <InputNumber
                                min={1}
                                max={50}
                                value={item.quantity}
                                onChange={(value) => updateItem(item.id, value)}
                                style={{ width: '60px', textAlign: 'center' }}
                            />

                            <div
                                style={{
                                    fontWeight: 'bold',
                                    minWidth: '100px',
                                    textAlign: 'right',
                                }}
                            >
                                {(item.price * item.quantity).toLocaleString()}{' '}
                                VND
                            </div>

                            <Popconfirm
                                title="Bạn có chắc chắn muốn xóa không?"
                                onConfirm={() => updateItem(item.id, 0)}
                                okText="Có"
                                cancelText="Không"
                            >
                                <Button
                                    style={{
                                        background: '#ff4d4f',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '6px 10px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Xóa
                                </Button>
                            </Popconfirm>
                        </div>
                    )}
                />
            </div>
                <HandleSelectVoucher
                    vouchers={vouchers}
                    selectedVoucher={selectedVoucher}
                    setSelectedVoucher={(voucher) =>
                        setSelectedVoucher(voucher, userRole)
                    }
                />

                <div
                    style={{
                        marginTop: 16,
                        padding: '10px',
                        background: '#fafafa',
                        borderRadius: '6px',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: 8,
                        }}
                    >
                        <Text strong style={{ color: '#333' }}>
                            Tổng bill:
                        </Text>
                        <Text strong style={{ color: '#333' }}>
                            {totalPrice.toLocaleString()} VND
                        </Text>
                    </div>

                    {discount > 0 && (
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: 8,
                            }}
                        >
                            <Text style={{ color: '#2ecc71' }}>Giảm giá:</Text>
                            <Text style={{ color: '#2ecc71' }}>
                                -{discount.toLocaleString()} VND
                            </Text>
                        </div>
                    )}

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Title
                            level={4}
                            style={{ color: '#ff6600', margin: 0 }}
                        >
                            Phải trả:
                        </Title>
                        <Title
                            level={4}
                            style={{ color: '#ff6600', margin: 0 }}
                        >
                            {finalPrice.toLocaleString()} VND
                        </Title>
                    </div>
                </div>

                <Button
                    type="primary"
                    onClick={() => {
                        console.log('Nút Tạo hóa đơn được nhấn');
                        onCreateBill();
                    }}
                    style={{ width: '100%', marginTop: 16 }}
                    disabled={bill.length === 0 || !selectedTable}
                >
                    Tạo hóa đơn
                </Button>
            </Space>
        </Card>
    );
};

export default ModalBill;
