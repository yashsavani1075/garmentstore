import { useNavigate } from "react-router-dom";
import "./CategoryTiles.css";

export default function CategoryTiles() {
  const navigate = useNavigate();

  const categories = [
    {
      title: "Men",
      image: "/Images/Men.png",
      path: "/male",
      className: "men-card",
    },
    {
      title: "Women",
      image: "/Images/Women.png",
      path: "/female",
      className: "women-card",
    },
    {
      title: "Kids",
      image: "/Images/Kids.png",
      path: "/kids",
      className: "kids-card",
    }
  ];

  return (
    <section className="category-section">
      <div className="category-grid">
        {categories.map((item) => (
          <div
            key={item.title}
            className={`category-cardg ${item.className}`}
            onClick={() => navigate(item.path)}
          >
            <img src={item.image} alt={item.title} />
            <div className="category-overlay">
              <p className="Title">
                {item.title}
              </p>
              <button>Explore</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}