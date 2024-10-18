import { Dropdown } from 'antd';
import React, { useEffect, useRef, useState } from 'react';

interface Notification {
    subject: string;
    text: string;
}

interface WebSocketMessage {
    update: any;
    cmdUpdateType: string;
    notifications: Notification[];
    totalUnreadCount: string;
}

export default function Alarmbell() {
    const url = `ws://ewon-vpn.ddns.net:8200/api/ws/plugins/notifications?token=${'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0YW4ubmd1eWVuQGF1Y29udGVjaC5jb20iLCJ1c2VySWQiOiI0MDU1MTQ4MC1hMmZjLTExZWUtYTAxNy0zZGMyZWFkNDdiZWMiLCJzY29wZXMiOlsiVEVOQU5UX0FETUlOIl0sInNlc3Npb25JZCI6IjNkYWUzZGRkLWU3MDUtNDhmYi05ZjUyLTNiOWI3Mzc5MDc4ZSIsImlzcyI6InRoaW5nc2JvYXJkLmlvIiwiaWF0IjoxNzA2NTEyMDQzLCJleHAiOjE3MDY1MjEwNDMsImZpcnN0TmFtZSI6IlRhbiIsImxhc3ROYW1lIjoiTmd1eWVuIiwiZW5hYmxlZCI6dHJ1ZSwiaXNQdWJsaWMiOmZhbHNlLCJ0ZW5hbnRJZCI6ImIwNTU2YzUwLTgwNjMtMTFlZS04OTM0LTg5NWU3Y2EwOGZhYiIsImN1c3RvbWVySWQiOiIxMzgxNDAwMC0xZGQyLTExYjItODA4MC04MDgwODA4MDgwODAifQ.CRsvKcLq4GSqNbyNljBZgeZ_9a7xQWlkjM8jzoOCw4GgOF-MYAAZx-0glsBMGL0Cyltf3I2NvUptYh3L6BKu0A'}`;
    const ws = useRef<WebSocket | null>(null);
    const [data, setData] = useState<WebSocketMessage[]>([]);
    const [totalUnreadCount, setTotalUnreadCount] = useState<string>("");
    const [obj1Processed, setObj1Processed] = useState<boolean>(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [obj4TotalUnreadCount, setObj4TotalUnreadCount] = useState<string>("");

    useEffect(() => {
        ws.current = new WebSocket(url);

        const obj1 = { unreadCountSubCmd: { cmdId: 1 } };

        ws.current.onopen = () => {
            console.log("WebSocket connection opened.");
            ws.current?.send(JSON.stringify(obj1));
        };

        ws.current.onclose = () => {
            console.log("WebSocket connection closed.");
        };

        return () => {
            console.log("Cleaning up WebSocket connection.");
            ws.current?.close();
        };
    }, [url]);

    useEffect(() => {
        const obj3 = { unsubCmd: { cmdId: 1 } };
        const obj2 = { unreadSubCmd: { limit: totalUnreadCount, cmdId: 1 } };

        ws.current.onmessage = (evt) => {
            const dataReceive = JSON.parse(evt.data) as WebSocketMessage;
            if (dataReceive.update !== null) {
                setTotalUnreadCount(dataReceive.totalUnreadCount);
                setData([...data, dataReceive]);
                setObj1Processed(true);
            } else if (dataReceive.cmdUpdateType === "NOTIFICATIONS" && dataReceive.notifications) {
                setNotifications(dataReceive.notifications);

                const totalUnreadCountFromObj2 = dataReceive.totalUnreadCount;

                setObj4TotalUnreadCount(totalUnreadCountFromObj2);
            }
        };

        if (obj1Processed) {
            ws.current?.send(JSON.stringify(obj3));
            ws.current?.send(JSON.stringify(obj2));
        }
    }, [totalUnreadCount, obj1Processed]);

    const slicedNotifications = notifications.slice(0, 6);

    const dataAlarm = (
        <div style={{ background: 'white', width: 500, borderRadius: 5, boxShadow: '0 0 5px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ padding: '10px 20px 10px 20px' }}>
                <p style={{ fontSize: 20, fontWeight: 600 }}> Alarms </p>
            </div>
            <hr />

            {slicedNotifications.length > 0 ? (
                <div style={{ overflowY: 'auto', maxHeight: 500 }}>
                    {slicedNotifications.map((notification, index) => (
                        <div style={{ padding: 10 }} key={index}>
                            <div style={{}}>
                                <p style={{ fontSize: 15, fontWeight: 600 }}>{notification.subject}</p>
                                <p>{notification.text}</p>

                                <hr />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>Not Data</p>
            )}
        </div>
    );

    return (
        <div>
            <Dropdown overlay={dataAlarm} trigger={['click']} >
                <div style={{ marginRight: 2, display: 'flex' }}>
                    <i className="pi pi-bell" style={{ fontSize: '1.5rem', }} />

                    {obj4TotalUnreadCount && (
                        <div
                            style={{ background: '#EF4444', borderRadius: 50, width: 17, height: 17, alignItems: 'center', position: 'relative', bottom: 10, right: 3 }}
                        >
                            <p style={{ fontSize: 11, textAlign: 'center', color: 'white' }} >
                                {obj4TotalUnreadCount}
                            </p>
                        </div>
                    )}
                </div>
            </Dropdown>
        </div>
    );
}
