import { db } from '../firebase'; 
import { collection, getDocs } from 'firebase/firestore';

export const fetchAdmins = async () => {
    try {
        const adminCollectionRef = collection(db, 'adminPanel');
        const adminSnapshot = await getDocs(adminCollectionRef);
        const adminList = adminSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
        
        return adminList;
    } catch (error) {
        console.error("Error fetching admins: ", error);
        return []; // Return an empty array in case of error
    }
};