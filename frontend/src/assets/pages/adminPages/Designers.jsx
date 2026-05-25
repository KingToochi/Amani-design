import {usestate, useEffect} from 'react';
import CustomFetch from '../../hooks/UseFetch';
import {BASE_URL} from '../../Url';
import { Link } from 'react-router-dom';

const Designers = () => {
    const [designers, setDesigners] = usestate([]);
    const url = `${BASE_URL}/admin/vendors`;

    const fetchDesigners = async () => {
        try {
            const response = await CustomFetch(url, {
                method: "GET",
            });
            setDesigners(response);
        } catch (error) {
            console.error("Error fetching designers:", error);
        }
    };

    useEffect(() => {
        fetchDesigners();
    }, []);

    return (
        <div>
            <h2>Designers</h2>
            <ul>
                {designers.map((designer) => (
                    <li key={designer._id}>
                        <Link to={`/admin/designers/${designer._id}`}>
                            {designer.fname} {designer.lname}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Designers;