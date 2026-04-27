import { useState, ChangeEvent, SyntheticEvent } from 'react';
import './App.css';
import CardList from './Components/CardList/CardList';
import Search from './Components/Search/Search';
import { CompanySearch } from './company';
import { searchCompanies } from './api';

function App() {
  const [search, setSearch] = useState<string>("");
  const [searchResult, setSearchResult] = useState<CompanySearch[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        console.log(e);
    };

    const onClick = async (e: SyntheticEvent) => {
        const result = await searchCompanies(search);
        //setServerError(result.data);
        if(typeof result === "string"){
          setServerError(result);
        }else if(Array.isArray(result.data.data)){
          setSearchResult(result.data.data);
        }
        console.log(searchResult);
    };
  return (
    <div className="App">
      <Search onClick={onClick} search={search} handleChange={handleChange}/>
      <CardList searchResults={searchResult}/>
      {serverError && <div>Unable to connect to API</div>}
    </div>
  );
}

export default App;
