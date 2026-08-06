import React, { createContext, useState, useEffect, useContext } from 'react';

const AppContext = createContext();

const goalConfigs = {
  lean_muscle: { name: 'Lean & Toned', note: '-10% deficit', multiplier: 0.9, proteinFactor: 2.0, carbPct: 0.35, fatPct: 0.25 },
  bulk: { name: 'Muscle Bulk', note: '+20% surplus', multiplier: 1.2, proteinFactor: 2.2, carbPct: 0.45, fatPct: 0.25 },
  athletic: { name: 'Athletic Performance', note: 'maintenance', multiplier: 1.0, proteinFactor: 1.8, carbPct: 0.40, fatPct: 0.25 },
  shred: { name: 'Shredded Cut', note: '-20% deficit', multiplier: 0.8, proteinFactor: 2.2, carbPct: 0.25, fatPct: 0.25 },
  power: { name: 'Power Building', note: '+15% surplus', multiplier: 1.15, proteinFactor: 2.0, carbPct: 0.40, fatPct: 0.30 },
  recomp: { name: 'Body Recomposition', note: '-5% deficit, high protein', multiplier: 0.95, proteinFactor: 2.0, carbPct: 0.30, fatPct: 0.25 }
};

const categories = ['All', 'Meals', 'Breads & Rice', 'Proteins & Dals', 'Dairy', 'Fruits', 'Snacks', 'Sweets', 'Beverages'];
const conversions = { g: 1, oz: 28.35, cup: 240, piece: 1 };

const baseFoods = [
  ['Daal Chawal', 'meals', 120, 3.6, 21.6, 2.0],
  ['Paneer Butter Masala', 'meals', 240, 8.0, 6.7, 20.0],
  ['Butter Chicken', 'meals', 253, 18.7, 5.3, 17.3],
  ['Chana Masala', 'meals', 120, 4.7, 18.7, 2.7],
  ['Chicken Biryani', 'meals', 180, 9.6, 22.4, 5.6],
  ['Veg Biryani', 'meals', 140, 3.2, 23.2, 4.0],
  ['Choole Bhature', 'meals', 275, 6.0, 37.5, 11.0],
  ['Chole Kulcha', 'meals', 260, 7.0, 42.0, 7.5],
  ['Matar Kulcha', 'meals', 230, 6.5, 40.0, 5.0],
  ['Dal Makhani', 'meals', 167, 5.3, 14.7, 10.0],
  ['Palak Paneer', 'meals', 147, 6.7, 5.3, 10.7],
  ['Paneer Tikka Masala', 'meals', 260, 10.5, 8.0, 21.0],
  ['Kadai Paneer', 'meals', 250, 11.0, 7.5, 19.5],
  ['Shahi Paneer', 'meals', 270, 9.5, 10.0, 22.0],
  ['Malai Kofta', 'meals', 290, 6.5, 18.0, 21.0],
  ['Sarson Ka Saag', 'meals', 110, 4.0, 9.0, 6.5],
  ['Rajma Chawal', 'meals', 124, 4.0, 22.4, 2.0],
  ['Khichdi', 'meals', 105, 3.0, 19.0, 2.0],
  ['Muttar Paneer', 'meals', 160, 6.7, 8.0, 10.7],
  ['Aloo Gobi', 'meals', 93, 2.0, 10.7, 4.7],
  ['Bhindi Masala', 'meals', 80, 2.0, 9.3, 4.0],
  ['Basmati Rice Cooked', 'breads & rice', 130, 2.7, 28.0, 0.3],
  ['Brown Rice Cooked', 'breads & rice', 112, 2.6, 24.0, 0.9],
  ['Jeera Rice', 'breads & rice', 145, 2.8, 29.0, 2.2],
  ['Lemon Rice', 'breads & rice', 165, 3.0, 30.0, 4.5],
  ['Curd Rice', 'breads & rice', 140, 4.2, 22.0, 4.0],
  ['Roti / Chapati', 'breads & rice', 70, 2.5, 15.0, 0.5, 'piece'],
  ['Amritsari Kulcha', 'breads & rice', 260, 7.0, 45.0, 6.0, 'piece'],
  ['Paneer Kulcha', 'breads & rice', 290, 10.0, 42.0, 9.0, 'piece'],
  ['Onion Kulcha', 'breads & rice', 240, 6.0, 44.0, 5.0, 'piece'],
  ['Missi Roti', 'breads & rice', 130, 5.5, 22.0, 2.5, 'piece'],
  ['Rumali Roti', 'breads & rice', 140, 4.0, 28.0, 1.5, 'piece'],
  ['Makki Roti', 'breads & rice', 150, 3.0, 28.0, 3.0, 'piece'],
  ['Tandoori Roti', 'breads & rice', 110, 4.0, 22.0, 1.0, 'piece'],
  ['Plain Paratha', 'breads & rice', 220, 4.0, 35.0, 7.0, 'piece'],
  ['Aloo Paratha', 'breads & rice', 290, 6.0, 45.0, 10.0, 'piece'],
  ['Lachha Paratha', 'breads & rice', 260, 5.0, 36.0, 11.0, 'piece'],
  ['Gobhi Paratha', 'breads & rice', 270, 5.5, 42.0, 9.0, 'piece'],
  ['Cheese Paratha', 'breads & rice', 340, 12.0, 40.0, 15.0, 'piece'],
  ['Butter Naan', 'breads & rice', 310, 9.0, 50.0, 8.0, 'piece'],
  ['Garlic Naan', 'breads & rice', 320, 9.0, 52.0, 8.5, 'piece'],
  ['Puri', 'breads & rice', 100, 2.0, 15.0, 5.0, 'piece'],
  ['Bhatura', 'breads & rice', 210, 4.0, 30.0, 8.0, 'piece'],
  ['Poha', 'breads & rice', 180, 3.0, 36.0, 3.0],
  ['Upma', 'breads & rice', 190, 4.0, 34.0, 4.5],
  ['Idli with Sambar', 'breads & rice', 180, 6.0, 34.0, 2.0, 'piece'],
  ['Masala Dosa', 'breads & rice', 320, 6.0, 50.0, 11.0, 'piece'],
  ['Rava Dosa', 'breads & rice', 220, 4.5, 38.0, 6.0, 'piece'],
  ['Uttapam', 'breads & rice', 210, 5.0, 36.0, 5.0, 'piece'],
  ['Appam', 'breads & rice', 120, 2.0, 24.0, 1.5, 'piece'],
  ['Moong Dal Cooked', 'proteins & dals', 105, 7.0, 19.0, 0.3],
  ['Masoor Dal Cooked', 'proteins & dals', 116, 9.0, 20.0, 0.4],
  ['Dal Tadka', 'proteins & dals', 118, 6.5, 16.0, 3.5],
  ['Arhar Dal / Toor Dal', 'proteins & dals', 110, 7.2, 18.0, 1.5],
  ['Soya Chunks Cooked', 'proteins & dals', 120, 15.0, 8.0, 0.5],
  ['Soya Chaap Tikka', 'proteins & dals', 180, 16.0, 11.0, 8.0],
  ['Malai Chaap', 'proteins & dals', 240, 14.0, 12.0, 16.0],
  ['Paneer Bhurji', 'proteins & dals', 210, 12.0, 6.0, 15.0],
  ['Tandoori Chicken', 'proteins & dals', 173, 20.0, 1.3, 9.3],
  ['Fish Tikka', 'proteins & dals', 140, 16.0, 1.3, 8.0],
  ['Chicken Tikka', 'proteins & dals', 150, 18.0, 1.5, 8.0],
  ['Egg Bhurji', 'proteins & dals', 147, 8.7, 2.7, 10.7],
  ['Boiled Egg', 'proteins & dals', 78, 6.3, 0.6, 5.3, 'piece'],
  ['Chicken Breast', 'proteins & dals', 165, 31.0, 0.0, 3.6],
  ['Mutton Curry', 'proteins & dals', 213, 17.3, 4.0, 14.7],
  ['Paneer raw', 'dairy', 265, 18.0, 1.2, 20.0],
  ['Whole Milk Curd / Dahi', 'dairy', 60, 3.2, 4.3, 3.4],
  ['Cow Milk', 'dairy', 65, 3.2, 4.7, 3.6, 'cup'],
  ['Buffalo Milk', 'dairy', 100, 3.8, 5.2, 6.9, 'cup'],
  ['Ghee', 'dairy', 900, 0.0, 0.0, 100.0],
  ['Sweet Lassi', 'dairy', 100, 2.5, 15.0, 3.0, 'cup'],
  ['Mango Lassi', 'dairy', 130, 3.0, 22.0, 3.5, 'cup'],
  ['Chaas / Buttermilk', 'dairy', 22, 1.0, 2.0, 0.75, 'cup'],
  ['Banana', 'fruits', 89, 1.1, 22.8, 0.3, 'piece'],
  ['Apple', 'fruits', 52, 0.3, 13.8, 0.2, 'piece'],
  ['Mango', 'fruits', 60, 0.8, 15.0, 0.4, 'piece'],
  ['Orange', 'fruits', 47, 0.9, 12.0, 0.1, 'piece'],
  ['Papaya', 'fruits', 43, 0.5, 11.0, 0.3],
  ['Samosa', 'snacks', 250, 4.0, 32.0, 12.0, 'piece'],
  ['Kachori', 'snacks', 280, 4.5, 32.0, 15.0, 'piece'],
  ['Bread Pakora', 'snacks', 220, 5.0, 26.0, 11.0, 'piece'],
  ['Dahi Bhalla', 'snacks', 190, 6.0, 25.0, 7.5, 'piece'],
  ['Dhokla', 'snacks', 75, 3.0, 12.0, 1.5, 'piece'],
  ['Medu Vada', 'snacks', 140, 3.0, 16.0, 7.5, 'piece'],
  ['Pani Puri', 'snacks', 30, 0.5, 4.6, 1.0, 'piece'],
  ['Bhel Puri', 'snacks', 185, 4.0, 32.0, 4.5],
  ['Pav Bhaji', 'snacks', 400, 8.0, 60.0, 14.0, 'piece'],
  ['Vada Pav', 'snacks', 300, 6.0, 44.0, 11.0, 'piece'],
  ['Roasted Chana', 'snacks', 360, 19.0, 58.0, 6.0],
  ['Roasted Makhana', 'snacks', 367, 10.0, 73.3, 6.7],
  ['Gulab Jamun', 'sweets', 150, 2.0, 24.0, 6.0, 'piece'],
  ['Rasgulla', 'sweets', 125, 2.5, 26.0, 1.0, 'piece'],
  ['Kaju Katli', 'sweets', 180, 3.5, 22.0, 9.0, 'piece'],
  ['Moong Dal Halwa', 'sweets', 280, 5.0, 32.0, 15.0],
  ['Gajar ka Halwa', 'sweets', 200, 3.3, 28.0, 8.0],
  ['Jalebi', 'sweets', 150, 1.0, 30.0, 3.0, 'piece'],
  ['Besan Ladoo', 'sweets', 180, 3.0, 24.0, 8.0, 'piece'],
  ['Kheer', 'sweets', 160, 4.0, 24.0, 5.3],
  ['Masala Chai', 'beverages', 75, 2.0, 12.0, 2.0, 'cup'],
  ['Filter Coffee', 'beverages', 80, 2.5, 12.0, 2.5, 'cup'],
  ['Tender Coconut Water', 'beverages', 19, 0.7, 3.7, 0.2, 'cup'],
  ['Sugarcane Juice', 'beverages', 90, 0.25, 22.5, 0.0, 'cup'],
  ['Nimbu Pani', 'beverages', 30, 0.0, 7.5, 0.0, 'cup']
];

const defaultFoodImages = {
  'Daal Chawal': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?fit=crop&w=200&h=200&q=80',
  'Paneer Butter Masala': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?fit=crop&w=200&h=200&q=80',
  'Butter Chicken': 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?fit=crop&w=200&h=200&q=80',
  'Chana Masala': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?fit=crop&w=200&h=200&q=80',
  'Chicken Biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?fit=crop&w=200&h=200&q=80',
  'Veg Biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?fit=crop&w=200&h=200&q=80',
  'Choole Bhature': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?fit=crop&w=200&h=200&q=80',
  'Dal Makhani': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?fit=crop&w=200&h=200&q=80',
  'Palak Paneer': 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?fit=crop&w=200&h=200&q=80',
  'Rajma Chawal': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?fit=crop&w=200&h=200&q=80',
  'Khichdi': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?fit=crop&w=200&h=200&q=80',
  'Muttar Paneer': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?fit=crop&w=200&h=200&q=80',
  'Aloo Gobi': 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?fit=crop&w=200&h=200&q=80',
  'Bhindi Masala': 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?fit=crop&w=200&h=200&q=80',
  'Basmati Rice Cooked': 'https://images.unsplash.com/photo-1516684732162-798a0062be99?fit=crop&w=200&h=200&q=80',
  'Brown Rice Cooked': 'https://images.unsplash.com/photo-1516684732162-798a0062be99?fit=crop&w=200&h=200&q=80',
  'Roti / Chapati': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?fit=crop&w=200&h=200&q=80',
  'Tandoori Roti': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?fit=crop&w=200&h=200&q=80',
  'Plain Paratha': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?fit=crop&w=200&h=200&q=80',
  'Aloo Paratha': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?fit=crop&w=200&h=200&q=80',
  'Butter Naan': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?fit=crop&w=200&h=200&q=80',
  'Garlic Naan': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?fit=crop&w=200&h=200&q=80',
  'Puri': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?fit=crop&w=200&h=200&q=80',
  'Bhatura': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?fit=crop&w=200&h=200&q=80',
  'Poha': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?fit=crop&w=200&h=200&q=80',
  'Upma': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?fit=crop&w=200&h=200&q=80',
  'Idli with Sambar': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?fit=crop&w=200&h=200&q=80',
  'Masala Dosa': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?fit=crop&w=200&h=200&q=80',
  'Moong Dal Cooked': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?fit=crop&w=200&h=200&q=80',
  'Masoor Dal Cooked': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?fit=crop&w=200&h=200&q=80',
  'Soya Chunks Cooked': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?fit=crop&w=200&h=200&q=80',
  'Paneer Bhurji': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?fit=crop&w=200&h=200&q=80',
  'Tandoori Chicken': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?fit=crop&w=200&h=200&q=80',
  'Fish Tikka': 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?fit=crop&w=200&h=200&q=80',
  'Chicken Tikka': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?fit=crop&w=200&h=200&q=80',
  'Egg Bhurji': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?fit=crop&w=200&h=200&q=80',
  'Boiled Egg': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?fit=crop&w=200&h=200&q=80',
  'Chicken Breast': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?fit=crop&w=200&h=200&q=80',
  'Mutton Curry': 'https://images.unsplash.com/photo-1544025162-d76694265947?fit=crop&w=200&h=200&q=80',
  'Paneer raw': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?fit=crop&w=200&h=200&q=80',
  'Whole Milk Curd / Dahi': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?fit=crop&w=200&h=200&q=80',
  'Cow Milk': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?fit=crop&w=200&h=200&q=80',
  'Buffalo Milk': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?fit=crop&w=200&h=200&q=80',
  'Ghee': 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?fit=crop&w=200&h=200&q=80',
  'Sweet Lassi': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?fit=crop&w=200&h=200&q=80',
  'Chaas / Buttermilk': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?fit=crop&w=200&h=200&q=80',
  'Banana': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?fit=crop&w=200&h=200&q=80',
  'Apple': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?fit=crop&w=200&h=200&q=80',
  'Mango': 'https://images.unsplash.com/photo-1553279768-865429fa0078?fit=crop&w=200&h=200&q=80',
  'Orange': 'https://images.unsplash.com/photo-1547514701-42782101795e?fit=crop&w=200&h=200&q=80',
  'Papaya': 'https://images.unsplash.com/photo-1517260739337-6799d239ce83?fit=crop&w=200&h=200&q=80',
  'Samosa': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?fit=crop&w=200&h=200&q=80',
  'Dhokla': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?fit=crop&w=200&h=200&q=80',
  'Medu Vada': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?fit=crop&w=200&h=200&q=80',
  'Pani Puri': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?fit=crop&w=200&h=200&q=80',
  'Bhel Puri': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?fit=crop&w=200&h=200&q=80',
  'Pav Bhaji': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?fit=crop&w=200&h=200&q=80',
  'Vada Pav': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?fit=crop&w=200&h=200&q=80',
  'Roasted Chana': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?fit=crop&w=200&h=200&q=80',
  'Roasted Makhana': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?fit=crop&w=200&h=200&q=80',
  'Gulab Jamun': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?fit=crop&w=200&h=200&q=80',
  'Rasgulla': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?fit=crop&w=200&h=200&q=80',
  'Gajar ka Halwa': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?fit=crop&w=200&h=200&q=80',
  'Jalebi': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?fit=crop&w=200&h=200&q=80',
  'Besan Ladoo': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?fit=crop&w=200&h=200&q=80',
  'Kheer': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?fit=crop&w=200&h=200&q=80',
  'Masala Chai': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?fit=crop&w=200&h=200&q=80',
  'Filter Coffee': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?fit=crop&w=200&h=200&q=80',
  'Tender Coconut Water': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?fit=crop&w=200&h=200&q=80',
  'Sugarcane Juice': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?fit=crop&w=200&h=200&q=80',
  'Nimbu Pani': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?fit=crop&w=200&h=200&q=80'
};

const categoryDefaultImages = {
  meals: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?fit=crop&w=200&h=200&q=80',
  'breads & rice': 'https://images.unsplash.com/photo-1516684732162-798a0062be99?fit=crop&w=200&h=200&q=80',
  'proteins & dals': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?fit=crop&w=200&h=200&q=80',
  dairy: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?fit=crop&w=200&h=200&q=80',
  fruits: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?fit=crop&w=200&h=200&q=80',
  snacks: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?fit=crop&w=200&h=200&q=80',
  sweets: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?fit=crop&w=200&h=200&q=80',
  beverages: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?fit=crop&w=200&h=200&q=80'
};

const toFoodHelper = (f) => {
  const name = f[0];
  const cat = f[1];
  const img = defaultFoodImages[name] || categoryDefaultImages[cat] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?fit=crop&w=200&h=200&q=80';
  return {
    category: cat,
    cal: f[2],
    protein: f[3],
    carbs: f[4],
    fat: f[5],
    unit: f[6] || 'g',
    per: f[6] ? 1 : 100,
    image: img
  };
};

const foodDatabase = {};
baseFoods.forEach((f) => {
  foodDatabase[f[0]] = toFoodHelper(f);
});

const generatedNames = ['Homemade', 'Spicy', 'Butter', 'Masala', 'Tandoori', 'Healthy', 'Low Calorie', 'High Protein', 'Dhaba Style', 'Classic', 'Less Oil', 'Special'];
baseFoods.slice(0, 59).forEach((f, index) => {
  const label = generatedNames[index % generatedNames.length] + ' ' + f[0];
  if (!foodDatabase[label]) {
    foodDatabase[label] = toFoodHelper([
      label,
      f[1],
      Math.round(f[2] * (0.92 + (index % 5) * 0.035)),
      +(f[3] * (0.95 + (index % 4) * 0.03)).toFixed(1),
      +(f[4] * (0.9 + (index % 6) * 0.035)).toFixed(1),
      +(f[5] * (0.9 + (index % 5) * 0.04)).toFixed(1),
      f[6]
    ]);
  }
});

const indianLanguages = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', native: 'اُردُو', flag: '🇮🇳' }
];

import { translations } from './translations';

export const AppProvider = ({ children }) => {
  // Config state (Hardcoded to Production Render URL)
  const apiBase = import.meta.env.VITE_API_BASE || 'https://onlygains-backend.onrender.com/api';

  const [lang, setLang] = useState(() => localStorage.getItem('fittrack_language') || 'en');
  const [activeTab, setActiveTab] = useState('home');
  const [toast, setToast] = useState(null);
  const [isCoachOpen, setIsCoachOpen] = useState(false);

  // User state
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('fittrack_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('fittrack_profile');
    return saved ? JSON.parse(saved) : null;
  });

  // Today log details
  const getTodayKey = () => {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };

  const [viewDateKey, setViewDateKey] = useState(getTodayKey());

  const [todayLog, setTodayLog] = useState(() => {
    const savedDate = localStorage.getItem('fittrack_log_date');
    if (savedDate === getTodayKey()) {
      const savedLog = localStorage.getItem('fittrack_log');
      return savedLog ? JSON.parse(savedLog) : [];
    }
    return [];
  });

  const [waterIntake, setWaterIntake] = useState(() => {
    const savedDate = localStorage.getItem('fittrack_water_date');
    if (savedDate === getTodayKey()) {
      const savedWater = localStorage.getItem('fittrack_water') || '0';
      const parsed = parseInt(savedWater, 10);
      return (parsed > 0 && parsed <= 20) ? parsed * 250 : parsed; // Migration
    }
    return 0;
  });

  // History & weekly aggregates
  const [weeklyData, setWeeklyData] = useState(() => JSON.parse(localStorage.getItem('fittrack_weekly') || '{}'));
  const [weeklyCalsData, setWeeklyCalsData] = useState(() => JSON.parse(localStorage.getItem('fittrack_weekly_cals') || '{}'));
  const [weeklyWatersData, setWeeklyWatersData] = useState(() => JSON.parse(localStorage.getItem('fittrack_weekly_waters') || '{}'));
  const [weeklyWeightsData, setWeeklyWeightsData] = useState(() => JSON.parse(localStorage.getItem('fittrack_weekly_weights') || '{}'));
  const [historyDays, setHistoryDays] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);

  const [syncStatus, setStatusState] = useState({ message: 'Cloud sync ready 💪', tone: 'muted' });

  // Weight history
  const [weightHistory, setWeightHistory] = useState(() => JSON.parse(localStorage.getItem('fittrack_weight_history') || '[]'));

  // Toast scheduler
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const setSyncStatus = (message, tone = 'muted') => {
    let displayMessage = message;
    if (message === 'Synced from Postgres') displayMessage = 'Synced progress 💪';
    else if (message === 'Saved to Postgres') displayMessage = 'Saved progress 💪';
    else if (message === 'Database sync ready') displayMessage = 'Cloud sync ready 💪';
    else if (message === 'Offline — data saved in browser') displayMessage = 'Saved locally (Offline) ✓';
    else if (message === 'Offline mode: changes saved locally') displayMessage = 'Saved locally (Offline) ✓';

    setStatusState({ message: displayMessage, tone });
  };

  // Compute daily totals
  const currentTotals = () => {
    let consumed = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;
    let burned = 0;
    let exercises = [];
    let foods = [];

    todayLog.forEach(x => {
      if (x.type === 'exercise' || x.unit === 'mins') {
        burned += Math.abs(x.cal);
        exercises.push(x);
      } else {
        consumed += x.cal;
        protein += x.protein;
        carbs += x.carbs;
        fat += x.fat;
        foods.push(x);
      }
    });

    return {
      cal: consumed,
      protein,
      carbs,
      fat,
      burned_cal: burned,
      exercises,
      foods
    };
  };

  // Sync state to local storage
  const saveLocalState = (profile = userProfile, log = todayLog, water = waterIntake, weekly = weeklyData, weeklyCals = weeklyCalsData, weeklyWaters = weeklyWatersData, weeklyWeights = weeklyWeightsData, dateKey = viewDateKey) => {
    localStorage.setItem('fittrack_profile', JSON.stringify(profile));
    localStorage.setItem('fittrack_log_date', dateKey);
    localStorage.setItem('fittrack_water_date', dateKey);
    localStorage.setItem('fittrack_log', JSON.stringify(log));
    localStorage.setItem('fittrack_water', water);
    localStorage.setItem('fittrack_weekly', JSON.stringify(weekly));
    localStorage.setItem('fittrack_weekly_cals', JSON.stringify(weeklyCals));
    localStorage.setItem('fittrack_weekly_waters', JSON.stringify(weeklyWaters));
    localStorage.setItem('fittrack_weekly_weights', JSON.stringify(weeklyWeights));
  };

  // API Call: Fetch Daily Log
  const loadDayFromDatabase = async (userId = currentUser?.id, dateKey = viewDateKey) => {
    if (!userId) return;
    try {
      const res = await fetch(`${apiBase}/daily/${encodeURIComponent(userId)}/${dateKey}`);
      if (!res.ok) throw new Error('Database read failed');
      const data = await res.json();

      let updatedProfile = userProfile;
      if (data.profile) {
        updatedProfile = data.profile;
        setUserProfile(data.profile);
        localStorage.setItem('fittrack_profile', JSON.stringify(data.profile));
        if (data.profile.language) {
          setLang(data.profile.language);
          localStorage.setItem('fittrack_language', data.profile.language);
        }
      }

      const savedLogDate = localStorage.getItem('fittrack_log_date');
      const isSameDate = savedLogDate === dateKey;

      let updatedLog = todayLog;
      let localNeedsUpload = false;
      if (data.log !== null && Array.isArray(data.log)) {
        if (data.log.length > 0 || !isSameDate) {
          updatedLog = data.log;
          setTodayLog(data.log);
        } else {
          localNeedsUpload = todayLog.length > 0;
        }
      } else {
        if (isSameDate && todayLog.length > 0) {
          localNeedsUpload = true;
        } else {
          updatedLog = [];
          setTodayLog([]);
        }
      }

      const savedWaterDate = localStorage.getItem('fittrack_water_date');
      const isSameWaterDate = savedWaterDate === dateKey;

      let updatedWater = waterIntake;
      if (data.waterIntake !== null && Number.isInteger(data.waterIntake)) {
        const incomingWater = (data.waterIntake <= 20 && data.waterIntake > 0) ? data.waterIntake * 250 : data.waterIntake;
        if (incomingWater > 0 || !isSameWaterDate) {
          updatedWater = incomingWater;
          setWaterIntake(incomingWater);
        } else {
          localNeedsUpload = waterIntake > 0;
        }
      } else {
        if (isSameWaterDate && waterIntake > 0) {
          localNeedsUpload = true;
        } else {
          updatedWater = 0;
          setWaterIntake(0);
        }
      }

      let updatedWeekly = weeklyData;
      let updatedWeeklyCals = weeklyCalsData;
      let updatedWeeklyWaters = weeklyWatersData;
      let updatedWeeklyWeights = weeklyWeightsData;

      if (data.weeklyData && typeof data.weeklyData === 'object') {
        if (data.weeklyData.proteins) {
          updatedWeekly = data.weeklyData.proteins;
          updatedWeeklyCals = data.weeklyData.cals || {};
          updatedWeeklyWaters = data.weeklyData.waters || {};
          updatedWeeklyWeights = data.weeklyData.weights || {};
        } else {
          updatedWeekly = data.weeklyData;
        }
        setWeeklyData(updatedWeekly);
        setWeeklyCalsData(updatedWeeklyCals);
        setWeeklyWatersData(updatedWeeklyWaters);
        setWeeklyWeightsData(updatedWeeklyWeights);
      }

      saveLocalState(updatedProfile, updatedLog, updatedWater, updatedWeekly, updatedWeeklyCals, updatedWeeklyWaters, updatedWeeklyWeights, dateKey);

      if (localNeedsUpload) {
        saveDailyToDatabase(userId, dateKey, updatedProfile, updatedLog, updatedWater, updatedWeekly);
      } else {
        setSyncStatus('Synced from Postgres', 'ok');
      }
    } catch (error) {
      setSyncStatus('Offline — data saved in browser', 'warn');
    }
  };

  // API Call: Save Daily Log
  const saveDailyToDatabase = async (
    userId = currentUser?.id,
    dateKey = viewDateKey,
    profile = userProfile,
    log = todayLog,
    water = waterIntake,
    weekly = weeklyData
  ) => {
    if (!profile || !userId) return;
    try {
      // Calculate totals inline
      let consumed = 0;
      let protein = 0;
      let carbs = 0;
      let fat = 0;
      let burned = 0;
      let exercises = [];
      let foods = [];

      log.forEach(x => {
        if (x.type === 'exercise' || x.unit === 'mins') {
          burned += Math.abs(x.cal);
          exercises.push(x);
        } else {
          consumed += x.cal;
          protein += x.protein;
          carbs += x.carbs;
          fat += x.fat;
          foods.push(x);
        }
      });

      const totals = {
        cal: consumed,
        protein,
        carbs,
        fat,
        burned_cal: burned,
        exercises,
        foods
      };

      const res = await fetch(`${apiBase}/daily/${encodeURIComponent(userId)}/${dateKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, log, waterIntake: water, weeklyData: weekly, totals })
      });
      if (!res.ok) throw new Error('Database write failed');
      setSyncStatus('Saved to Postgres', 'ok');
      fetchHistory(userId);
    } catch (error) {
      setSyncStatus('Offline mode: changes saved locally', 'warn');
    }
  };

  // API Call: Fetch History & Streak
  const fetchHistory = async (userId = currentUser?.id) => {
    if (!userId) return;
    try {
      const res = await fetch(`${apiBase}/history/${encodeURIComponent(userId)}?limit=40`);
      if (res.ok) {
        const data = await res.json();
        const days = data.days || [];
        setHistoryDays(days);
        calculateStreak(days);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  const calculateStreak = (days = historyDays) => {
    if (!days || days.length === 0) {
      setCurrentStreak(0);
      return;
    }
    // Parse dates and sort descending
    const dates = days.map(d => {
      const parts = d.log_date.split('T')[0].split('-');
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }).sort((a, b) => b - a);

    let streak = 0;
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);

    const hasDate = (d) => {
      return dates.some(x => {
        const copy = new Date(x);
        copy.setHours(0, 0, 0, 0);
        return copy.getTime() === d.getTime();
      });
    };

    // Allow today or yesterday as streak start
    if (hasDate(checkDate)) {
      streak = 1;
    } else {
      checkDate.setDate(checkDate.getDate() - 1);
      if (hasDate(checkDate)) {
        streak = 1;
      } else {
        setCurrentStreak(0);
        return;
      }
    }

    while (true) {
      checkDate.setDate(checkDate.getDate() - 1);
      if (hasDate(checkDate)) {
        streak++;
      } else {
        break;
      }
    }
    setCurrentStreak(streak);
  };

  // Color Theme Manager
  const applyTheme = (themeValue) => {
    const theme = themeValue || localStorage.getItem('fittrack_theme') || 'system';
    if (theme === 'light') {
      document.body.classList.add('theme-light');
    } else if (theme === 'dark') {
      document.body.classList.remove('theme-light');
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        document.body.classList.remove('theme-light');
      } else {
        document.body.classList.add('theme-light');
      }
    }
  };

  // Initialize data on start
  useEffect(() => {
    applyTheme();
    if (currentUser) {
      loadDayFromDatabase(currentUser.id, viewDateKey);
      fetchHistory(currentUser.id);
    }
  }, [currentUser]);

  // Handle viewDateKey changes
  useEffect(() => {
    if (currentUser) {
      // Re-read local storage for the specific date if matches, else empty
      const savedDate = localStorage.getItem('fittrack_log_date');
      if (savedDate === viewDateKey) {
        const savedLog = localStorage.getItem('fittrack_log');
        setTodayLog(savedLog ? JSON.parse(savedLog) : []);
        const savedWater = localStorage.getItem('fittrack_water') || '0';
        const parsed = parseInt(savedWater, 10);
        setWaterIntake((parsed > 0 && parsed <= 20) ? parsed * 250 : parsed);
      } else {
        setTodayLog([]);
        setWaterIntake(0);
      }
      loadDayFromDatabase(currentUser.id, viewDateKey);
    }
  }, [viewDateKey]);

  return (
    <AppContext.Provider value={{
      // Configurations
      goalConfigs,
      categories,
      conversions,
      baseFoods,
      foodDatabase,
      indianLanguages,
      translations,
      
      // Global values
      lang,
      setLang: (l) => {
        setLang(l);
        localStorage.setItem('fittrack_language', l);
        if (userProfile) {
          const updated = { ...userProfile, language: l };
          setUserProfile(updated);
          localStorage.setItem('fittrack_profile', JSON.stringify(updated));
          saveDailyToDatabase(currentUser?.id, viewDateKey, updated);
        }
      },
      activeTab,
      setActiveTab,
      toast,
      showToast,
      apiBase,
      isCoachOpen,
      setIsCoachOpen,
      syncStatus,
      setSyncStatus,

      // Authentication
      currentUser,
      setCurrentUser,
      loginUser: (user) => {
        localStorage.setItem('fittrack_user', JSON.stringify(user));
        setCurrentUser(user);
      },
      signOut: () => {
        localStorage.removeItem('fittrack_user');
        localStorage.removeItem('fittrack_profile');
        localStorage.removeItem('fittrack_log');
        localStorage.removeItem('fittrack_water');
        localStorage.removeItem('fittrack_weekly');
        setCurrentUser(null);
        setUserProfile(null);
        setTodayLog([]);
        setWaterIntake(0);
        showToast('Signed out successfully', 'success');
      },

      // Profile details
      userProfile,
      setUserProfile: (prof) => {
        setUserProfile(prof);
        localStorage.setItem('fittrack_profile', JSON.stringify(prof));
        saveDailyToDatabase(currentUser?.id, viewDateKey, prof);
      },

      // Tracking variables
      viewDateKey,
      setViewDateKey,
      todayLog,
      setTodayLog: (log) => {
        setTodayLog(log);
        localStorage.setItem('fittrack_log', JSON.stringify(log));
        saveDailyToDatabase(currentUser?.id, viewDateKey, userProfile, log);
      },
      waterIntake,
      setWaterIntake: (w) => {
        setWaterIntake(w);
        localStorage.setItem('fittrack_water', w);
        saveDailyToDatabase(currentUser?.id, viewDateKey, userProfile, todayLog, w);
      },
      weeklyData,
      weeklyCalsData,
      weeklyWatersData,
      weeklyWeightsData,
      historyDays,
      currentStreak,
      weightHistory,
      saveWeightData: (weight) => {
        const newEntry = {
          weight: Number(weight),
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          timestamp: Date.now()
        };
        const updatedHistory = [newEntry, ...weightHistory];
        setWeightHistory(updatedHistory);
        localStorage.setItem('fittrack_weight_history', JSON.stringify(updatedHistory));
        showToast(`Weight recorded: ${weight} kg`, 'success');

        if (userProfile) {
          const updatedProfile = { ...userProfile, weight: Number(weight) };
          setUserProfile(updatedProfile);
          
          // Re-render local and DB
          const today = getTodayKey();
          const currentWeekly = { ...weeklyData };
          const currentWeeklyWeights = { ...weeklyWeightsData };
          currentWeeklyWeights[today] = Number(weight);

          setWeeklyWeightsData(currentWeeklyWeights);
          saveLocalState(updatedProfile, todayLog, waterIntake, weeklyData, weeklyCalsData, weeklyWatersData, currentWeeklyWeights);
          saveDailyToDatabase(currentUser?.id, viewDateKey, updatedProfile, todayLog, waterIntake, weeklyData);
        }
      },
      deleteWeightEntry: (timestamp) => {
        const updated = weightHistory.filter(w => w.timestamp !== timestamp);
        setWeightHistory(updated);
        localStorage.setItem('fittrack_weight_history', JSON.stringify(updated));
        showToast('Weight entry deleted', 'info');
      },

      // Utilities
      currentTotals,
      loadDayFromDatabase,
      saveDailyToDatabase,
      fetchHistory,
      applyTheme,
      getTodayKey
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
