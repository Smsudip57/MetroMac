"use client";

import {store} from "@/redux/store";
import React from "react";
import {Provider} from "react-redux";

interface StoreProviderProps {
    children: React.ReactNode;
}

const StoreProvider: React.FC<StoreProviderProps> = ({children}) => {
    return <Provider store={store}>{children}</Provider>;
};

export default StoreProvider;
