import { useParams } from "react-router-dom";

export default function List() {
    const {list_id} = useParams();
    return (
        <>
        <h1>{list_id}'s List</h1>
        </>
    );
}