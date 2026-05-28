import {useState, useEffect} from "react";
import {BASE_URL} from "../../Url";
import CustomFetch from "../../hooks/UseFetch";
import ServerError from "../../components/ServerError";

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const url = `${BASE_URL}/admin/customers`;

    const fetchCustomers = async () => {
        try {
            const response = await CustomFetch(url, {
                method: "GET",
            });
            const data = await response.json();
            setCustomers(data.customers);
            setLoading(false);
        } catch (error) {
            setError(error);
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleViewCustomer = (id) => {
        // Implement navigation to customer details page
        // For example, using React Router:
        navigate(`/admin/viewCustomer/${id}`);
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <ServerError />;
    }

    return(
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-gray-900">Customers</h1>
                        <p className="mt-1 text-sm text-gray-600">Review registered customers and their contact details.</p>
                    </div>
                    <div className="rounded-lg bg-white border border-gray-200 px-4 py-3 shadow-sm">
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Total customers</p>
                        <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
                    </div>
                </div>

                <div className="overflow-x-auto bg-white shadow rounded-xl border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200 table-auto">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Username</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {customers.length > 0 ? (
                                customers.map((customer) => (
                                    <tr key={customer._id} className="hover:bg-gray-50 transition-colors duration-150">
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {`${customer.lname || ''} ${customer.fname || ''}`.trim() || customer.username || 'Guest'}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{customer.username || '—'}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{customer.email || '—'}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{customer.phoneNumber || '—'}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{customer.status || 'active'}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                                            <button onClick={() => handleViewCustomer(customer._id)} className="text-green-700 hover:text-green-900 cursor-pointer">View Details</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-4 py-8 text-center text-sm text-gray-500">
                                        No customers found yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Customers;