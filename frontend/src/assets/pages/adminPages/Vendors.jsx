import {useState, useEffect} from 'react';
import CustomFetch from '../../hooks/UseFetch';
import {BASE_URL} from '../../Url';
import ServerError from '../../components/ServerError';

const Vendors = () => {
    const [vendorsData, setVendorsData] = useState([])
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const url = `${BASE_URL}/admin/vendors`;

    const category = [
        "all vendors",
        "pending",
        "approved",
        "rejected",
       "manufacturers",
        "wholesalers",
        "retailers",
        "nonSubscribers",
        "subscribers",
        "basicSubscribers",
        "standardSubscribers",
        "premiumSubscribers",
        "activeSubscribers",
        "pastDueSubscribers",
        "canceledSubscribers",
        "trialSubscribers",
        "inactiveSubscribers",
    ]

    const handleCategory = (category) => {
        if (category === "all vendors") {
            setVendors(vendorsData);
            return;
        }
        if (category === "approved" || category === "rejected" || category === "pending") {
            setVendors(vendorsData.filter(vendor => vendor.status === category));
            return;
        }
        if (category === "manufacturers" || category === "wholesalers" || category === "retailers") {
            setVendors(vendorsData.filter(vendor => category.includes(vendor.typeOfVendor)));
            return;
        }
        if (category === "nonSubscribers") {
            setVendors(vendorsData.filter(vendor => vendor.subscriber === false));
            return;
        }
        if (category === "subscribers") {
            setVendors(vendorsData.filter(vendor => vendor.subscriber === true));
            return;
        }
        if (category === "basicSubscribers" || category === "standardSubscribers" || category === "premiumSubscribers") {
            setVendors(vendorsData.filter(vendor => category.includes(vendor.subscriptionDetails?.plan)));
            return;
        }
        if (category === "activeSubscribers" || category === "pastDueSubscribers" || category === "canceledSubscribers" || category === "inactiveSubscribers" || category === "trialSubscribers") {
            setVendors(vendorsData.filter(vendor => category.includes(vendor.subscriptionDetails?.status)));
            return;
        }
        setVendors(vendorsData);
    }

    const sortVendorsAlphabetically = (vendorList) => {
        return vendorList.slice().sort((a, b) => {
            const aName = `${a.lname || ''} ${a.fname || ''}`.trim().toLowerCase();
            const bName = `${b.lname || ''} ${b.fname || ''}`.trim().toLowerCase();
            return aName.localeCompare(bName);
        });
    };

    const fetchVendors = async () => {
        try {
            const response = await CustomFetch(url, {
                method: 'GET',
            });

            const data = await response.json();

            if (data.success && Array.isArray(data.vendors)) {
                setVendorsData(sortVendorsAlphabetically(data.vendors));
                setVendors(sortVendorsAlphabetically(data.vendors));
            } else {
                setError('No vendors found.');
            }
        } catch (fetchError) {
            console.error('Error fetching vendors:', fetchError);
            setError('Unable to load vendors.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendors();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="text-gray-700">Loading vendors...</div>
            </div>
        );
    }

    if (error) {
        return <ServerError message={error} />;
    }

    

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div>
                {category.map((cat, index) => {
                    return (<button
                    key={index}
                    onClick={() => handleCategory(cat)}
                    className="px-4 py-2 mr-2 mb-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    {cat}
                </button>
                    )
                })}
            </div>
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col gap-4 mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900">Vendors</h2>
                    <p className="text-sm text-gray-600">Vendor list sorted alphabetically by last name.</p>
                </div>

                <div className="overflow-x-auto bg-white shadow rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200 table-auto">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {vendors.map((vendor) => (
                                <tr key={vendor._id} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{`${vendor.lname || ''} ${vendor.fname || ''}`.trim() || vendor.username}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{vendor.username || '—'}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{vendor.email || '—'}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{vendor.typeOfVendor || '—'}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{vendor.status || '—'}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{vendor.subscriptionDetails?.plan || 'none'}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{vendor.subscriptionDetails?.status || 'inactive'}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{vendor.phoneNumber || '—'}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                                        <button className="text-green-700 hover:text-green-900 cursor-pointer">View Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Vendors;