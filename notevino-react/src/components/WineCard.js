import React from "react";
import { Card, CardBody, CardTitle } from "shards-react";
import "./WineCard.css";

function WineCard({ wine }) {
  const placeholderImage = "https://via.placeholder.com/250?text=No+Image";

  return (
    <Card className="wine-card">
      <CardBody>
        <div className="wine-card-header">
          <div className="wine-card-content">
            <CardTitle className="wine-card-title">{wine.name}</CardTitle>
            <p className="wine-card-info">
              <span className="wine-card-label">Region</span>
              <span className="wine-card-text">{wine.region}</span>
            </p>
            <p className="wine-card-info">
              <span className="wine-card-label">Type</span>
              <span className="wine-card-text">{wine.type}</span>
            </p>
            <p className="wine-card-info">
              <span className="wine-card-label">Vintage</span>
              <span className="wine-card-text">{wine.vintage}</span>
            </p>
          </div>
          <div className="wine-card-image-container">
            <img
              src={wine.imageUrl || placeholderImage}
              alt={wine.name}
              className="wine-card-image"
              onError={(e) => {
                e.target.src = placeholderImage;
              }}
            />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export default WineCard;
