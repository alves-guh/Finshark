import React from 'react'
import "./Card.css";

interface Props {
  companyName: string;
  ticker: string;
  price: number;
}

const Card = ({ companyName, ticker, price }: Props) => {
  return <div className="card">
    <img src="https://picsum.photos/200/300" 
         alt="Image" 
         />
    <div className="details">
        <h2>
          {companyName} ({ticker})
        </h2>
        <p>${price}</p>
    </div>
    <p className="info">Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugit, natus?</p>
  </div>
}

export default Card