import {db} from "../../../../firebase";
import {collection, getDocs, doc, getDoc} from "firebase/firestore"
const Home = () => {
    const fetchUserById = async (userId) => {
        try {
            const docRef = doc(db, "users", userId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                console.log(docSnap.data());
                console.log("User fetched successfully");
                return docSnap.data();
            } else {
                console.log("No such document!");
            }
         }catch (error) {
            console.error("Error fetching user:", error);
        }
    };


    return ( 
        <div>

        </div>
     );
}
 
export default Home;