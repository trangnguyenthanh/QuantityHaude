"use client";
import type { Demo } from "@/types";
import { ChartData, ChartOptions } from "chart.js";
import { Button } from "primereact/button";
import { Chart } from "primereact/chart";
import { Column } from "primereact/column";
import { DataTable,DataTableFilterMeta } from "primereact/datatable";
import { InputNumber } from "primereact/inputnumber";
import { Tag } from "primereact/tag";
import { useContext, useEffect, useRef, useState } from "react";
import { LayoutContext } from "../../../layout/context/layoutcontext";
import http from "./https";
import { InputText } from "primereact/inputtext";

import axios, { AxiosInstance } from "axios";
import { useRouter } from "next/navigation";


const Banking = () => {
    const [data, setData] = useState<string[]>([]);

    console.log('data: ', data);


    const [searchText, setSearchText] = useState('');
    const [maxHeight, setMaxHeight] = useState<number>(500);
    const router = useRouter();
 
    const headerToken = {
        headers: {
            "Content-Type": "application/json",
            "X-Authorization": `Bearer ${'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0YW4ubmd1eWVuQGF1Y29udGVjaC5jb20iLCJ1c2VySWQiOiI0MDU1MTQ4MC1hMmZjLTExZWUtYTAxNy0zZGMyZWFkNDdiZWMiLCJzY29wZXMiOlsiVEVOQU5UX0FETUlOIl0sInNlc3Npb25JZCI6ImU2NDAwODQ2LTYxNDktNDJmYy1hOTMxLWU1NmY5NTAzNmE3NyIsImlzcyI6InRoaW5nc2JvYXJkLmlvIiwiaWF0IjoxNzA4MDUxNDk1LCJleHAiOjE3MDgwNjA0OTUsImZpcnN0TmFtZSI6IlRhbiIsImxhc3ROYW1lIjoiTmd1eWVuIiwiZW5hYmxlZCI6dHJ1ZSwiaXNQdWJsaWMiOmZhbHNlLCJ0ZW5hbnRJZCI6ImIwNTU2YzUwLTgwNjMtMTFlZS04OTM0LTg5NWU3Y2EwOGZhYiIsImN1c3RvbWVySWQiOiIxMzgxNDAwMC0xZGQyLTExYjItODA4MC04MDgwODA4MDgwODAifQ.gYKGs4gB8D5UN1VsnMDZAYIY_NNbWsskyV65Tqq28awsVlassLlbgKN5BNAPlfeNboPDB017hp185JIQAUeFdA'}`
         },
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('http://ewon-vpn.ddns.net:8200/api/tenant/devices?pageSize=100&page=0',
                    headerToken
                );
                
                setData(res.data.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData()
    },[])

    const nameBodyTemplate = (rowData: Demo.Payment) => {
        return (
            <>
                <span className="p-column-title">Name</span>
                {rowData.Name}
            </>
        );
    };

    const amountBodyTemplate = (rowData: Demo.Payment) => {
        return (
            <>
                <span className="p-column-title">DeviceProfile</span>

                {rowData.DeviceProfile}
            </>
        );
    };

    const dateBodyTemplate = (rowData: Demo.Payment) => {
        return (
            <>
                <span className="p-column-title">Id</span>
                {rowData.id}
            </>
        );
    };



    const filteredData = data.filter(item => {
        return ( 
            item.name.toLowerCase().includes(searchText.toLowerCase()) ||
            item.type.toLowerCase().includes(searchText.toLowerCase())

            )
    });
    
    const renderHeader = () => {
        return (
            <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
                <span className="p-input-icon-left w-full sm:w-20rem flex-order-1 sm:flex-order-0">
                    <i className="pi pi-search"></i>
                    <InputText
                        placeholder="Global Search"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
        
                        className="w-full"
                    />
                </span>
              
            </div>
        );
    };
  
    const handleRowClick = (event:any) => {
        const selectedId = event.data.id;
        localStorage.setItem('deviceId',selectedId)

        const selectedName = event.data.Name;
        localStorage.setItem('deviceName', selectedName);
        

        console.log("Selected ID:", selectedId);
        router.push('/data-realtime')
    };
    return (
        <div className="">
        
            <div style={{width:'100%'}}>
         
            <DataTable
                    header={renderHeader()}
                    value={filteredData.map((item, index) => ({ 
                        Name: item.type,
                        DeviceProfile: item.name, 
                        id: item.id.id, 
                        date: "" 
                    }))}
                    className="datatable-responsive"
                    emptyMessage="No products found."
                    onRowClick={handleRowClick}

                >
                        <Column
                        sortable
                            field="Name"
                            header="Name"
                            body={nameBodyTemplate}
                            headerClassName="white-space-nowrap w-4"
                        ></Column>
                        <Column
                            field="DeviceProfile"
                            header="Device Profile"
                            body={amountBodyTemplate}
                            headerClassName="white-space-nowrap w-4"
                        ></Column>
                        <Column
                            field="id"
                            header="Id"
                            body={dateBodyTemplate}
                            headerClassName="white-space-nowrap w-4"
                        ></Column>
                    
                    </DataTable>

                    </div>
        </div>
    );
};

export default Banking;

