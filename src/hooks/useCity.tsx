import { createContext, useContext, useState, ReactNode } from "react";
import { IndianCity, INDIAN_CITIES, DEFAULT_CITY } from "@/lib/cities";

interface CityContextType {
  city: IndianCity;
  setCity: (city: IndianCity) => void;
}

const CityContext = createContext<CityContextType>({
  city: DEFAULT_CITY,
  setCity: () => {},
});

export const useCity = () => useContext(CityContext);

export const CityProvider = ({ children }: { children: ReactNode }) => {
  const [city, setCity] = useState<IndianCity>(() => {
    const saved = localStorage.getItem("rolematch_city");
    if (saved) {
      const found = INDIAN_CITIES.find((c) => c.id === saved);
      if (found) return found;
    }
    return DEFAULT_CITY;
  });

  const handleSetCity = (newCity: IndianCity) => {
    setCity(newCity);
    localStorage.setItem("rolematch_city", newCity.id);
  };

  return (
    <CityContext.Provider value={{ city, setCity: handleSetCity }}>
      {children}
    </CityContext.Provider>
  );
};
