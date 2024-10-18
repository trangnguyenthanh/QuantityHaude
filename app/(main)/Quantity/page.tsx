'use client'
import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

interface Quantity {
    ID?: string;
    Ngaythang: string;
    MaNhanVien: string;
    TenNhanVien: string;
    DonHang: string;
    MaHang: string;
    MaCongDoan: string;
    TenCongDoan: string;
    SoLuong: string;
}

const FORM_STORAGE_KEY = 'quantityFormData';

export default function QuantityHaude(): JSX.Element {
    const [quantities, setQuantities] = useState<Quantity[]>([]);
    const [filteredQuantities, setFilteredQuantities] = useState<Quantity[]>([]);
    const [selectedQuantities, setSelectedQuantities] = useState<Quantity[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [displayDialog, setDisplayDialog] = useState<boolean>(false);
    const [newQuantity, setNewQuantity] = useState<Quantity>({
        Ngaythang: '', MaNhanVien: '', TenNhanVien: '', DonHang: '',
        MaHang: '', MaCongDoan: '', TenCongDoan: '', SoLuong: '', ID: ''
    });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [globalFilterValue, setGlobalFilterValue] = useState<string>('');
    const URL = "https://6703f462ab8a8f8927326425.mockapi.io/Haude/Quantity/QuantityHaude";

    useEffect(() => {
        fetchQuantities();
        loadFormData();
    }, []);

    useEffect(() => {
        filterQuantities();
    }, [quantities, globalFilterValue]);
    const filterQuantities = () => {
        const lowercaseFilter = globalFilterValue.toLowerCase();
        const filtered = quantities.filter(item => 

            item.TenNhanVien.toLowerCase().includes(lowercaseFilter) ||
            item.DonHang.toLowerCase().includes(lowercaseFilter) ||

            item.MaNhanVien.toLowerCase().includes(lowercaseFilter) ||
            item.MaHang.toLowerCase().includes(lowercaseFilter) ||
            item.SoLuong.toLowerCase().includes(lowercaseFilter) ||

            item.MaCongDoan.toLowerCase().includes(lowercaseFilter) ||

            item.TenCongDoan.toLowerCase().includes(lowercaseFilter)
        );
        setFilteredQuantities(filtered);
    };

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGlobalFilterValue(e.target.value);
    };

    const onSearchClick = () => {
        filterQuantities();
    };

    const renderHeader = () => {
        return (
            <div className="flex justify-content-end">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText 
                        value={globalFilterValue} 
                        onChange={onGlobalFilterChange} 
                        placeholder="Tìm kiếm..." 
                    />
                </span>
                <Button 
                    label="Tìm kiếm" 
                    icon="pi pi-search" 
                    onClick={onSearchClick} 
                    className="ml-2"
                />
            </div>
        );
    };

    const header = renderHeader();
    const fetchQuantities = async (): Promise<void> => {
        setLoading(true);
        try {
            const response = await fetch(URL);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            if (Array.isArray(data)) {
                setQuantities(data);
            } else {
                console.error('Received data is not an array:', data);
                setQuantities([]);
            }
        } catch (error) {
            console.error('Error fetching quantities:', error);
            setQuantities([]);
        } finally {
            setLoading(false);
        }
    };

    const loadFormData = () => {
        const savedData = localStorage.getItem(FORM_STORAGE_KEY);
        if (savedData) {
            setNewQuantity(JSON.parse(savedData));
            
        }
    };

    const saveFormData = (data: Quantity) => {
        localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(data));
    };

    const addOrUpdateQuantity = async (): Promise<void> => {
        try {
            const method = isEditing ? 'PUT' : 'POST';
            const url = isEditing ? `${URL}/${newQuantity.ID}` : URL;
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newQuantity),
            });
            if (!response.ok) {
                throw new Error(`Failed to ${isEditing ? 'update' : 'add'} quantity`);
            }
            await fetchQuantities(); // Refresh the data
            setDisplayDialog(false);
            setIsEditing(false);
            // Don't reset the form here, just save the form data
            saveFormData(newQuantity);
        } catch (error) {
            console.error(`Error ${isEditing ? 'updating' : 'adding'} quantity:`, error);
        }
    };
    
    const addNew = (): void => {
        setIsEditing(false);
        
        // Retrieve saved form data from localStorage
        const savedFormData = localStorage.getItem(FORM_STORAGE_KEY);
        const emptyForm = {
            Ngaythang: '', MaNhanVien: '', TenNhanVien: '', DonHang: '',
            MaHang: '', MaCongDoan: '', TenCongDoan: '', SoLuong: '', ID: ''
        };
        
        // Parse saved form data or use empty form
        const formToUse = savedFormData ? JSON.parse(savedFormData) : emptyForm;
        
        setNewQuantity(formToUse);
        saveFormData(formToUse);  // Save form data to localStorage
        setDisplayDialog(true);
    };
    

    const deleteQuantity = async (id: string): Promise<void> => {
        try {
            const response = await fetch(`${URL}/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete quantity');
            }
            await fetchQuantities(); // Refresh the data
        } catch (error) {
            console.error('Error deleting quantity:', error);
        }
    };

    const deleteSelectedQuantities = async (): Promise<void> => {
        try {
            for (const quantity of selectedQuantities) {
                if (quantity.ID) {
                    await deleteQuantity(quantity.ID);
                }
            }
            setSelectedQuantities([]);
        } catch (error) {
            console.error('Error deleting selected quantities:', error);
        }
    };

    const confirmDelete = (id: string) => {
        confirmDialog({
            message: 'Are you sure you want to delete this quantity?',
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => deleteQuantity(id),
        });
    };

    const confirmDeleteSelected = () => {
        confirmDialog({
            message: 'Are you sure you want to delete the selected quantities?',
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => deleteSelectedQuantities(),
        });
    };
  
    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>, name: keyof Quantity): void => {
        const val = e.target.value || ''
        const updatedQuantity = { ...newQuantity, [name]: val };
        setNewQuantity(updatedQuantity);
        saveFormData(updatedQuantity);
    };

   

    const editQuantity = (quantity: Quantity): void => {
        setIsEditing(true);
        setNewQuantity({ ...quantity });
        setDisplayDialog(true);
    };

    const actionBodyTemplate = (rowData: Quantity) => {
        return (
            <div>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editQuantity(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => confirmDelete(rowData.ID!)} />
            </div>
        );
    };

    return (
        <div>
           <div className="p-d-flex p-jc-between p-ai-center mb-3">
                <Button label="Add New" icon="pi pi-plus" onClick={addNew} className="p-button-success" />
                <Button label="Delete Selected" icon="pi pi-trash" onClick={confirmDeleteSelected} 
                        className="p-button-danger" disabled={!selectedQuantities.length} />
            </div>
            
            <DataTable 
                value={filteredQuantities.length > 0 ? filteredQuantities : quantities} 
                loading={loading}
                emptyMessage="No quantities found"
                selection={selectedQuantities}
                onSelectionChange={(e: any) => setSelectedQuantities(e.value)}
                dataKey="ID"
                selectionMode="multiple"
                size={'small'}
                resizableColumns
                showGridlines
                header={header}
            >
                <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                <Column field="ID" header="ID" />
                <Column field="Ngaythang" header="Ngày tháng" />
                <Column field="MaNhanVien" header="Mã nhân viên" />
                <Column field="TenNhanVien" header="Tên nhân viên" />
                <Column field="DonHang" header="Đơn hàng" />
                <Column field="MaHang" header="Mã hàng" />
                <Column field="MaCongDoan" header="Mã công đoạn" />
                <Column field="TenCongDoan" header="Tên công đoạn" />
                <Column field="SoLuong" header="Số lượng" />
                <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }} />
            </DataTable>

            <Dialog visible={displayDialog} header={isEditing ? "Edit Quantity" : "Add New Quantity"} modal={true} 
                    onHide={() => setDisplayDialog(false)}>
                <div className="p-fluid">
                    <div className="p-field mb-3">
                        <label htmlFor="Ngaythang">Ngày tháng</label>
                        <InputText id="Ngaythang" value={newQuantity.Ngaythang} onChange={(e) => onInputChange(e, 'Ngaythang')} />
                    </div>
                    <div className="p-field mb-3">
                        <label htmlFor="MaNhanVien">Mã nhân viên</label>
                        <InputText id="MaNhanVien" value={newQuantity.MaNhanVien} onChange={(e) => onInputChange(e, 'MaNhanVien')} />
                    </div>
                    <div className="p-field mb-3">
                        <label htmlFor="TenNhanVien">Tên nhân viên</label>
                        <InputText id="TenNhanVien" value={newQuantity.TenNhanVien} onChange={(e) => onInputChange(e, 'TenNhanVien')} />
                    </div>
                    <div className="p-field mb-3">
                        <label htmlFor="DonHang">Đơn hàng</label>
                        <InputText id="DonHang" value={newQuantity.DonHang} onChange={(e) => onInputChange(e, 'DonHang')} />
                    </div>
                    <div className="p-field mb-3">
                        <label htmlFor="MaHang">Mã hàng</label>
                        <InputText id="MaHang" value={newQuantity.MaHang} onChange={(e) => onInputChange(e, 'MaHang')} />
                    </div>
                    <div className="p-field mb-3">
                        <label htmlFor="MaCongDoan">Mã công đoạn</label>
                        <InputText id="MaCongDoan" value={newQuantity.MaCongDoan} onChange={(e) => onInputChange(e, 'MaCongDoan')} />
                    </div>
                    <div className="p-field mb-3">
                        <label htmlFor="TenCongDoan">Tên công đoạn</label>
                        <InputText id="TenCongDoan" value={newQuantity.TenCongDoan} onChange={(e) => onInputChange(e, 'TenCongDoan')} />
                    </div>
                    <div className="p-field mb-3">
                        <label htmlFor="SoLuong">Số lượng</label>
                        <InputText id="SoLuong" value={newQuantity.SoLuong} onChange={(e) => onInputChange(e, 'SoLuong')} />
                    </div>
                    <Button label={isEditing ? "Update" : "Save"} icon="pi pi-check" onClick={addOrUpdateQuantity} />
                </div>
            </Dialog>
            <ConfirmDialog />
        </div>
    );
}