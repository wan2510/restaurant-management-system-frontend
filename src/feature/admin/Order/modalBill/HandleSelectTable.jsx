import React from "react";
import { Select } from "antd";

const { Option } = Select;

const HandleSelectTable = ({ tables, selectedTable, setSelectedTable }) => {
  return (
    <Select
      placeholder="Chọn bàn"
      style={{ width: "100%" }}
      value={selectedTable || undefined}
      onChange={setSelectedTable}
    >
      {tables && tables.length > 0 ? (
        tables.map((table) => (
          <Option 
            key={table.id} 
            value={table.number}
            disabled={table.status === "unavailable"}
          >
            {`Bàn ${table.number} - ${table.max_number_human} người`}
          </Option>
        ))
      ) : (
        <Option value="" disabled>
          Không có bàn nào
        </Option>
      )}
    </Select>
  );
};

export default HandleSelectTable;