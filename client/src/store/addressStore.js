import { create } from 'zustand';
import api from '../utils/api';

const useAddressStore = create((set, get) => ({
    addresses: [],
    selectedAddress: null,
    loading: false,
    error: null,
    
    // Delivery check info
    deliveryAvailable: null,
    deliveryEstimate: null,
    deliveryCheckLoading: false,

    fetchAddresses: async () => {
        set({ loading: true, error: null });
        try {
            const { data } = await api.get('/addresses');
            const addresses = data.data;
            
            // Auto-select default if none is currently selected
            const currentSelected = get().selectedAddress;
            const defaultAddr = addresses.find(a => a.isDefault) || (addresses.length > 0 ? addresses[0] : null);
            
            set({ 
                addresses, 
                loading: false,
                selectedAddress: currentSelected || defaultAddr
            });
            
            if (!currentSelected && defaultAddr) {
                get().checkDeliveryServiceability(defaultAddr.pincode);
            }
        } catch (error) {
            set({ 
                loading: false, 
                error: error.response?.data?.message || 'Failed to fetch addresses' 
            });
        }
    },

    addAddress: async (addressData) => {
        set({ loading: true, error: null });
        try {
            const { data } = await api.post('/addresses', addressData);
            const newAddress = data.data;
            set(state => {
                const newAddresses = [newAddress, ...state.addresses];
                // If it's the first one, or marked as default, make it selected
                if (newAddresses.length === 1 || newAddress.isDefault) {
                    get().checkDeliveryServiceability(newAddress.pincode);
                    return { 
                        addresses: newAddresses, 
                        selectedAddress: newAddress,
                        loading: false 
                    };
                }
                return { addresses: newAddresses, loading: false };
            });
            return newAddress;
        } catch (error) {
            set({ loading: false, error: error.response?.data?.message || 'Failed to add address' });
            throw error;
        }
    },

    updateAddress: async (id, addressData) => {
        set({ loading: true, error: null });
        try {
            const { data } = await api.put(`/addresses/${id}`, addressData);
            const updatedAddress = data.data;
            set(state => {
                const updatedList = state.addresses.map(a => a._id === id ? updatedAddress : a);
                const updateSelected = state.selectedAddress?._id === id;
                if (updateSelected) {
                    get().checkDeliveryServiceability(updatedAddress.pincode);
                }
                return {
                    addresses: updatedList,
                    selectedAddress: updateSelected ? updatedAddress : state.selectedAddress,
                    loading: false
                };
            });
            return updatedAddress;
        } catch (error) {
            set({ loading: false, error: error.response?.data?.message || 'Failed to update address' });
            throw error;
        }
    },

    deleteAddress: async (id) => {
        set({ loading: true, error: null });
        try {
            await api.delete(`/addresses/${id}`);
            set(state => {
                const newList = state.addresses.filter(a => a._id !== id);
                let newSelected = state.selectedAddress;
                if (newSelected?._id === id) {
                    newSelected = newList.find(a => a.isDefault) || newList[0] || null;
                    if (newSelected) {
                        get().checkDeliveryServiceability(newSelected.pincode);
                    } else {
                        set({ deliveryAvailable: null, deliveryEstimate: null });
                    }
                }
                return { addresses: newList, selectedAddress: newSelected, loading: false };
            });
        } catch (error) {
            set({ loading: false, error: error.response?.data?.message || 'Failed to delete address' });
            throw error;
        }
    },

    setSelectedAddress: (address) => {
        set({ selectedAddress: address });
        get().checkDeliveryServiceability(address?.pincode);
    },
    
    // Simulate checking delivery capability and getting an estimate based on pincode
    checkDeliveryServiceability: async (pincode) => {
        if (!pincode) {
            set({ deliveryAvailable: null, deliveryEstimate: null });
            return;
        }
        
        set({ deliveryCheckLoading: true });
        
        // Simulating an API call for delivery eligibility
        setTimeout(() => {
            // Fake logic: if pincode starts with '0', not serviceable
            if (pincode.startsWith('0')) {
                set({ 
                    deliveryAvailable: false, 
                    deliveryEstimate: null,
                    deliveryCheckLoading: false 
                });
            } else {
                set({ 
                    deliveryAvailable: true, 
                    deliveryEstimate: 'Tomorrow',
                    deliveryCheckLoading: false
                });
            }
        }, 800);
    },
    
    lookupPincode: async (pincode) => {
        try {
            const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
            const data = await response.json();
            
            if (data && data[0] && data[0].Status === 'Success') {
                const postOffice = data[0].PostOffice[0];
                return {
                    city: postOffice.District,
                    state: postOffice.State,
                    district: postOffice.District,
                    locality: postOffice.Name,
                    success: true
                };
            }
            return { success: false, message: 'Invalid Pincode' };
        } catch (error) {
            return { success: false, message: 'Failed to lookup pincode' };
        }
    }
}));

export default useAddressStore;
