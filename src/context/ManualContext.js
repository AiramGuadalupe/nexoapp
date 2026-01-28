import React, { createContext, useState, useContext } from 'react';

const ManualContext = createContext();

export const useManual = () => useContext(ManualContext);

export const ManualProvider = ({ children }) => {
    const [isManualOpen, setIsManualOpen] = useState(false);

    const openManual = () => setIsManualOpen(true);
    const closeManual = () => setIsManualOpen(false);
    const toggleManual = () => setIsManualOpen((prev) => !prev);

    return (
        <ManualContext.Provider value={{ isManualOpen, openManual, closeManual, toggleManual }}>
            {children}
        </ManualContext.Provider>
    );
};
