"use client";

import { format } from "date-fns";
import { Button, Input, Table, message } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";

export default function Page() {

    const idValue = localStorage.getItem('deviceId')
    const nameValue = localStorage.getItem('deviceName')
    const [latestData, setLatestData] = useState<any>([]);
    console.log("latestData: ", latestData);
    const [latestTimeFromObj2, setLatestTimeFromObj2] = useState<any>(null);
    const [searchKeyword, setSearchKeyword] = useState<string>("");

    

    const [name, setNames] = useState<string[]>([
        "Tank_Pressure_AI",
        "Pipe_Pressure_AI",
        "Temperature_01_AI",
        "Temperature_02_AI",
        "Liquid_Level_AI",
        "Flow_Rate_AI",
        "Spare_01_AI",
        "Spare_02_AI",
        "Spare_03_AI",
        "Spare_04_AI",
        "Vaporizer_Status_04_DI",
        "Solenoid_01_DO",
        "Solenoid_02_DO",
        "Warning_Buzzer_DO",
        "Gas_1_Low_DI",
        "Gas_2_Low_DI",
        "Gas_3_Low_DI",
        "Gas_1_High_DI",
        "Gas_2_High_DI",
        "Gas_3_High_DI",
        "E_Stop_DI",
        "Vaporizer_Status_01_DI",
        "Vaporizer_Status_02_DI",
        "Vaporizer_Status_03_DI",
    ]);

    const [displayNames, setDisplayNames] = useState<any>({
        Tank_Pressure_AI: "Tank Pressure",
        Pipe_Pressure_AI: "Pipe Pressure",
        Temperature_01_AI: "Temperature 01 AI",
        Temperature_02_AI: "Temperature 02 AI",
        Liquid_Level_AI: "Liquid Level AI",
        Flow_Rate_AI: "Flow Rate AI",
        Spare_01_AI: "Spare 01 AI",
        Spare_02_AI: "Spare 02 AI",
        Spare_03_AI: "Spare 03 AI",
        Spare_04_AI: "Spare 04 AI",
        Vaporizer_Status_04_DI: "Vaporizer_Status_04_DI",
        Solenoid_01_DO: "Solenoid_01_DO",
        Solenoid_02_DO: "Solenoid_02_DO",
        Warning_Buzzer_DO: "Warning_Buzzer_DO",
        Gas_1_Low_DI: "Gas_1_Low_DI",
        Gas_2_Low_DI: "Gas_2_Low_DI",
        Gas_3_Low_DI: "Gas_3_Low_DI",
        Gas_1_High_DI: "Gas_1_High_DI",
        Gas_2_High_DI: "Gas_2_High_DI",
        Gas_3_High_DI: "Gas_3_High_DI",
        E_Stop_DI: "E_Stop_DIVaporizer_Status_01_DI",
        Vaporizer_Status_01_DI: "Vaporizer_Status_01_DI",
        Vaporizer_Status_02_DI: "Vaporizer_Status_02_DI",
        Vaporizer_Status_03_DI: "Vaporizer_Status_03_DI",
    });

    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        const url = `ws://ewon-vpn.ddns.net:8200/api/ws/plugins/telemetry?token=${"eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0YW4ubmd1eWVuQGF1Y29udGVjaC5jb20iLCJ1c2VySWQiOiI0MDU1MTQ4MC1hMmZjLTExZWUtYTAxNy0zZGMyZWFkNDdiZWMiLCJzY29wZXMiOlsiVEVOQU5UX0FETUlOIl0sInNlc3Npb25JZCI6IjFiOTg0YzkwLTBhM2YtNDBiMC04OWUwLWNhNTBhYTA3ZGMzYiIsImlzcyI6InRoaW5nc2JvYXJkLmlvIiwiaWF0IjoxNzA2NTg3OTMyLCJleHAiOjE3MDY1OTY5MzIsImZpcnN0TmFtZSI6IlRhbiIsImxhc3ROYW1lIjoiTmd1eWVuIiwiZW5hYmxlZCI6dHJ1ZSwiaXNQdWJsaWMiOmZhbHNlLCJ0ZW5hbnRJZCI6ImIwNTU2YzUwLTgwNjMtMTFlZS04OTM0LTg5NWU3Y2EwOGZhYiIsImN1c3RvbWVySWQiOiIxMzgxNDAwMC0xZGQyLTExYjItODA4MC04MDgwODA4MDgwODAifQ.iPF-tmzMQOoVLU4doc0jIcfCobZRpc0kxAxNhqe3f-d_QzLhwBRxGYdraNNilLBIIvm-Y8ekrkEat2YprryeGA"}`; // Thay đổi your_token bằng token thực của bạn
        ws.current = new WebSocket(url);
        const unixTimeSeconds = Date.now();
        let obj1 = {
            entityDataCmds: [
                {
                    query: {
                        entityFilter: {
                            type: "singleEntity",
                            singleEntity: {
                                entityType: "DEVICE",
                                id: idValue,
                            },
                        },
                        pageLink: {
                            pageSize: 1024,
                            page: 0,
                            sortOrder: {
                                key: {
                                    type: "ENTITY_FIELD",
                                    key: "createdTime",
                                },
                                direction: "DESC",
                            },
                        },
                        entityFields: [
                            {
                                type: "ENTITY_FIELD",
                                key: "name",
                            },
                            {
                                type: "ENTITY_FIELD",
                                key: "label",
                            },
                            {
                                type: "ENTITY_FIELD",
                                key: "additionalInfo",
                            },
                        ],
                        latestValues: [],
                    },
                    cmdId: 4,
                },
            ],
        };

        let obj2 = {
            entityDataCmds: [
                {
                    cmdId: 4,
                    tsCmd: {
                        keys: name,
                        startTs: unixTimeSeconds,
                        timeWindow: 61000,
                        interval: 1000,
                        limit: 10000,
                        agg: "NONE",
                    },
                },
            ],
        };

        ws.current.onopen = () => {
            setTimeout(() => {
                if (ws.current) {
                    ws.current.send(JSON.stringify(obj1));
                    ws.current.send(JSON.stringify(obj2));
                }
            }, 1000);
        };

        ws.current.onclose = () => {};

        return () => {
            ws.current?.close();
        };
    }, []);

    useEffect(() => {
        if (ws.current) {
            ws.current.onmessage = (evt) => {
                const dataReceive = JSON.parse(evt.data);
                if (dataReceive.update !== null) {
                    setLatestData([dataReceive]);
                    const vnDateTime = format(
                        new Date(),
                        "yyyy-MM-dd HH:mm:ss",
                        {
                            timeZone: "Asia/Ho_Chi_Minh",
                        }
                    );
                    setLatestTimeFromObj2(vnDateTime);
                }
            };
        }
    }, [latestData]);

    const filteredKeys = name.filter((key: string) =>
        key.toLowerCase().includes(searchKeyword.toLowerCase())
    );


    const renderHeader = () => {
        return (
            <div className="flex flex-wrap gap-2 align-items-center justify-content-between">

        <span style={{fontSize:20}}> {nameValue}</span>

                <span className="p-input-icon-left w-full sm:w-20rem flex-order-1 sm:flex-order-0">
                    <i className="pi pi-search"></i>
                    <InputText
                        placeholder="Search"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
        
                        className="w-full"
                    />
                </span>
              
            </div>
        );
    };
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

    return (
        <div>
            <div style={{ marginTop: 20, borderRadius: 3 }}>
                {latestData.map((dt, dataIndex) => (
                    <div
                        style={{ marginTop: 20 }}
                        className="dataValueRes"
                        key={dataIndex}
                    >
                     
                                <DataTable
                                    header={renderHeader()}
                                    value={filteredKeys.map((key, index) => ({
                                        Name: latestTimeFromObj2,
                                        DeviceProfile: displayNames[key],
                                        id: dt.update[0]?.timeseries[
                                            key
                                        ][0]?.value?.slice(0, 5),
                                        date: "",
                                    }))}
                                    className="datatable-responsive"
                                    emptyMessage="No products found."
                                >
                                    <Column
                                        sortable
                                        field="Name"
                                        header="Time update"
                                        body={nameBodyTemplate}
                                        headerClassName="white-space-nowrap w-4"
                                    ></Column>
                                    <Column
                                        field="DeviceProfile"
                                        header="Name"
                                        body={amountBodyTemplate}
                                        headerClassName="white-space-nowrap w-4"
                                    ></Column>
                                    <Column
                                        field="id"
                                        header="Value"
                                        body={dateBodyTemplate}
                                        headerClassName="white-space-nowrap w-4"
                                    ></Column>
                                </DataTable>
                       
                    </div>
                ))}
            </div>
        </div>
    );
}
