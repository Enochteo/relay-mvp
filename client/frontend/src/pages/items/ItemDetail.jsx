import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";

function ItemDetail() {
    const { id } = useParams();
    const [item, setItem] = useState(null);

    useEffect(() => {
        api.get(`/items/${id}/`).then(res => setItem(res.data));

    }, [id]);

    if (!item) return <p>Loading...</p>
    return (
        <div className="app-shell">
            <h2>{item.title}</h2>
            <p>{item.description}</p>
      <strong>${item.price}</strong>
      <div>
        {item.images.map(img => (
          <img key={img.id} src={img.image} alt={item.title} style={{ width: 200 }} />
        ))}
      </div>
        </div>
    );
}

export default ItemDetail;