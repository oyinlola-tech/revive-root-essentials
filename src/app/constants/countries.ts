/**
 * Supported countries for international e-commerce platform
 * Organized by region for better UX
 */

export const COUNTRIES_BY_REGION = {
  "Africa": [
    "Nigeria",
    "Ghana",
    "Kenya",
    "South Africa",
    "Uganda",
    "Tanzania",
    "Rwanda",
    "Ethiopia",
    "Cameroon",
    "Senegal",
    "Zimbabwe",
    "Botswana",
    "Namibia",
    "Zambia",
    "Malawi",
  ],
  "Americas": [
    "United States",
    "Canada",
    "Mexico",
    "Brazil",
    "Colombia",
    "Argentina",
    "Jamaica",
    "Trinidad and Tobago",
  ],
  "Europe": [
    "United Kingdom",
    "Germany",
    "France",
    "Italy",
    "Spain",
    "Netherlands",
    "Belgium",
    "Switzerland",
    "Sweden",
    "Poland",
    "Ireland",
  ],
  "Asia": [
    "India",
    "Pakistan",
    "Bangladesh",
    "Sri Lanka",
    "Philippines",
    "Indonesia",
    "Malaysia",
    "Singapore",
    "Thailand",
    "Vietnam",
    "Japan",
    "South Korea",
    "Hong Kong",
  ],
  "Middle East": [
    "United Arab Emirates",
    "Saudi Arabia",
    "Qatar",
    "Kuwait",
    "Bahrain",
    "Oman",
    "Israel",
    "Lebanon",
  ],
} as const;

// Flatten all countries into a single array for easier access
export const SUPPORTED_COUNTRIES = Object.values(COUNTRIES_BY_REGION)
  .flat()
  .sort() as readonly string[];

// Country to currency mapping (optional but helpful)
export const COUNTRY_TO_CURRENCY: Record<string, string> = {
  "Nigeria": "NGN",
  "Ghana": "GHS",
  "Kenya": "KES",
  "South Africa": "ZAR",
  "Uganda": "UGX",
  "Tanzania": "TZS",
  "Rwanda": "RWF",
  "Ethiopia": "ETB",
  "Cameroon": "XAF",
  "Senegal": "XOF",
  "Zimbabwe": "ZWL",
  "Botswana": "BWP",
  "Namibia": "NAD",
  "Zambia": "ZMW",
  "Malawi": "MWK",
  "United States": "USD",
  "Canada": "CAD",
  "Mexico": "MXN",
  "Brazil": "BRL",
  "Colombia": "COP",
  "Argentina": "ARS",
  "Jamaica": "JMD",
  "Trinidad and Tobago": "TTD",
  "United Kingdom": "GBP",
  "Germany": "EUR",
  "France": "EUR",
  "Italy": "EUR",
  "Spain": "EUR",
  "Netherlands": "EUR",
  "Belgium": "EUR",
  "Switzerland": "CHF",
  "Sweden": "SEK",
  "Poland": "PLN",
  "Ireland": "EUR",
  "India": "INR",
  "Pakistan": "PKR",
  "Bangladesh": "BDT",
  "Sri Lanka": "LKR",
  "Philippines": "PHP",
  "Indonesia": "IDR",
  "Malaysia": "MYR",
  "Singapore": "SGD",
  "Thailand": "THB",
  "Vietnam": "VND",
  "Japan": "JPY",
  "South Korea": "KRW",
  "Hong Kong": "HKD",
  "United Arab Emirates": "AED",
  "Saudi Arabia": "SAR",
  "Qatar": "QAR",
  "Kuwait": "KWD",
  "Bahrain": "BHD",
  "Oman": "OMR",
  "Israel": "ILS",
  "Lebanon": "LBP",
};

// Common states/provinces by country (you can expand this)
export const STATES_BY_COUNTRY: Record<string, readonly string[]> = {
  "Nigeria": [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
    "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
    "FCT", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi",
    "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun",
    "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
  ],
  "Ghana": [
    "Ashanti", "Bono", "Bono East", "Central", "Eastern", "Greater Accra",
    "North East", "Northern", "Oti", "Savannah", "Upper East", "Upper West",
    "Volta", "Western", "Western North"
  ],
  "Kenya": [
    "Baringo", "Bomet", "Bungoma", "Busia", "Calibri", "Embu", "Garissa",
    "Homa Bay", "Isiolo", "Kajiado", "Kakamega", "Kericho", "Kiambu", "Kilifi",
    "Kirinyaga", "Kisii", "Kisumu", "Kitui", "Kota Bahru", "Kwale", "Lamu",
    "Laikipia", "Lumbwa", "Machakos", "Makueni", "Mandera", "Marsabit", "Meru",
    "Migori", "Milk", "Mombasa", "Murang'a", "Musoma", "Nairobi", "Nakuru",
    "Nandi", "Narok", "Nyamira", "Nyeri", "Samburu", "Siaya", "Taita-Taveta",
    "Tana River", "Tharaka-Nithi", "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot"
  ],
  "South Africa": [
    "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo",
    "Mpumalanga", "Northern Cape", "North West", "Western Cape"
  ],
  "United States": [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
    "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
    "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine",
    "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
    "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
    "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
    "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
    "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia",
    "Washington", "West Virginia", "Wisconsin", "Wyoming", "District of Columbia"
  ],
  "Canada": [
    "Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland",
    "Northwest Territories", "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island",
    "Quebec", "Saskatchewan", "Yukon"
  ],
  "United Kingdom": [
    "England", "Scotland", "Wales", "Northern Ireland"
  ],
  "Germany": [
    "Baden-Württemberg", "Bavaria", "Berlin", "Brandenburg", "Bremen",
    "Hamburg", "Hesse", "Lower Saxony", "Mecklenburg-Vorpommern",
    "North Rhine-Westphalia", "Rhineland-Palatinate", "Saarland",
    "Saxony", "Saxony-Anhalt", "Schleswig-Holstein", "Thuringia"
  ],
};

// Default state/province options for regions without specific mappings
export const DEFAULT_STATES = [
  "State/Province 1",
  "State/Province 2",
  "State/Province 3",
] as const;

export type SupportedCountry = typeof SUPPORTED_COUNTRIES[number];
