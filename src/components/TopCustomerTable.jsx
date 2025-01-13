import React, { useState, useEffect } from 'react';
import './topCustomerTable.css';
import { fetchRecords } from '../api/fetchapi.js';

const TopCustomerTable = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const mergeCustomersByEmail = (data) => {
        const emailMap = {};
        data.forEach((customer) => {
            const emailKey = customer.Email || '';
            if (emailMap[emailKey]) {
                const existingCustomer = emailMap[emailKey];
                if (customer.Status !== 'Declined') {
                    existingCustomer.Amount += customer.Amount || 0;
                }
                existingCustomer.Quantity += customer.Quantity;
                existingCustomer.Notes += ', ' + customer.Notes;
            } else {
                emailMap[emailKey] = { ...customer };
            }
        });
        return Object.values(emailMap);
    };

    const fetchTopCustomers = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchRecords(1, 10000); // Fetch all records
            const mergedCustomers = mergeCustomersByEmail(data.records);

            // Sort by amount in descending order and get the top 10 customers
            const topCustomers = mergedCustomers
                .sort((a, b) => b.Amount - a.Amount) // Sort in descending order
                .slice(0, 10); // Get top 10 customers

            setCustomers(topCustomers);
        } catch (err) {
            setError('Error fetching customers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTopCustomers();
    }, []);

    return (
        <div className="topCustomer">
            <h3>Potential Customers</h3>
            <div className="topCustomerTable">
                <table className="customer-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Insta Link</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5">Loading...</td>
                            </tr>
                        ) : customers.length > 0 ? (
                            customers.map((customer, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{customer.Full_Name}</td>
                                    <td>{customer.Email}</td>
                                    <td>
                                        <a
                                            href={customer.user_info?.Model_Insta_Link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {customer.user_info?.Model_Insta_Link || 'N/A'}
                                        </a>
                                    </td>
                                    <td>{Math.round(customer.Amount)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5">No customers found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {error && <p className="error">{error}</p>}
            </div>
        </div>
    );
};

export default TopCustomerTable;