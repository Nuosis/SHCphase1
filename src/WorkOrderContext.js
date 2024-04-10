import React, { createContext, useContext, useState } from 'react';

const WorkOrderContext = createContext();

export const useWorkOrder = () => useContext(WorkOrderContext);

export const WorkOrderProvider = ({ children }) => {
    const [workOrderData, setWorkOrderData] = useState({});

    return (
        <WorkOrderContext.Provider value={{ workOrderData, setWorkOrderData }}>
            {children}
        </WorkOrderContext.Provider>
    );
};
