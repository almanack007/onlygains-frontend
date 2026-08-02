/**
 * Dynamic Food Dataset Service
 * Fetches nutrition, food names, brand info, and food images at runtime from live APIs
 * (Open Food Facts API & Nutrition Dataset endpoints) with zero hardcoded requirements.
 */

const OFF_SEARCH_URL = 'https://world.openfoodfacts.org/cgi/search.pl';
const OFF_API_V2_URL = 'https://world.openfoodfacts.org/api/v2/search';

/**
 * Sanitize image URLs to HTTPS
 */
function sanitizeImageUrl(url) {
  if (!url || typeof url !== 'string') {
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?fit=crop&w=200&h=200&q=80';
  }
  return url.replace(/^http:/, 'https:');
}

/**
 * Fetch dynamic food dataset at runtime by search query or category
 */
export async function fetchFoodDataset(query = '', category = 'All') {
  const cleanQuery = (query || '').trim();
  
  // Category search keywords mapping for runtime API calls
  const categoryKeywords = {
    'Meals': 'curry biryani rice thali meal',
    'Breads & Rice': 'bread rice roti naan paratha kulcha',
    'Proteins & Dals': 'chicken dal lentils fish egg paneer tofu',
    'Dairy': 'milk yogurt curd cheese paneer lassi',
    'Fruits': 'banana apple mango orange fruit',
    'Snacks': 'samosa pakora chips snack nuts biscuit',
    'Sweets': 'sweet halwa jamun cake chocolate',
    'Beverages': 'tea coffee juice drink lassi water',
    'Open Food Facts': 'food'
  };

  const searchTerm = cleanQuery 
    ? cleanQuery 
    : (category !== 'All' ? (categoryKeywords[category] || category) : 'indian food');

  try {
    const url = `${OFF_SEARCH_URL}?search_terms=${encodeURIComponent(searchTerm)}&search_simple=1&action=process&json=1&page_size=30`;
    
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`Food API returned status ${res.status}`);
    }

    const data = await res.json();
    if (!data.products || !Array.isArray(data.products)) {
      return [];
    }

    const results = data.products
      .filter(p => p && (p.product_name || p.brands || p.product_name_en))
      .map((p, idx) => {
        const name = (p.product_name || p.product_name_en || p.brands || 'Food Item').trim();
        const brand = (p.brands || '').trim();
        const rawImage = p.image_front_small_url || p.image_front_thumb_url || p.image_front_url || p.image_small_url || p.image_url || null;
        const image = sanitizeImageUrl(rawImage);
        
        const n = p.nutriments || {};
        const cal = Math.round(
          n['energy-kcal_100g'] || 
          n['energy-kcal_value'] || 
          (n['energy_100g'] ? n['energy_100g'] / 4.184 : 0) ||
          150
        );

        const protein = Number((n.proteins_100g || n.proteins_value || 0).toFixed(1));
        const carbs = Number((n.carbohydrates_100g || n.carbohydrates_value || 0).toFixed(1));
        const fat = Number((n.fat_100g || n.fat_value || 0).toFixed(1));

        return {
          id: `runtime-${p.code || idx}-${Date.now()}`,
          name: name,
          displayName: brand ? `${name} (${brand})` : name,
          brand: brand,
          category: category !== 'All' ? category : (p.categories ? p.categories.split(',')[0] : 'General'),
          cal: cal > 0 ? cal : 150,
          protein,
          carbs,
          fat,
          unit: 'g',
          per: 100,
          image: image,
          isRuntimeApi: true
        };
      });

    return results;
  } catch (err) {
    console.warn('[Food API Service] Error fetching live food dataset:', err.message);
    return [];
  }
}
