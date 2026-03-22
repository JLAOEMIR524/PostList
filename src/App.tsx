import './App.css'
import  Papa  from "papaparse";
import React, { useState } from "react";
import { addData, getData, removeDB } from './functions/db';
import { escapeHtml } from './functions/functions';

interface Bewohner {
  Nachname: string;
  Name: string;
  Zimmer: string;
  Department: string;
  Role: string;
  id: number;
}

function App() {
  const [parsedData, setParsedData] = useState<Bewohner[]>([]);
  const [filteredData, setFilterResult] = useState<Bewohner[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fileChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.[0]) return;

    Papa.parse(event.target.files[0], {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: function (results) {

        if(results.errors.length > 0){
          setError("The file couldn't be read.")
          return;
        }

        if(results.data.length == 0){
          setError("The File appears to be empty.")
          return;
        }

        const requiredColumns = ["Nachname", "Name", "Zimmer", "Department", "Role", "id"]
        const headers = results.meta.fields ?? [];

        const missingColumns = requiredColumns.filter((element) => {
          return !headers.includes(element);
        })

        if(missingColumns.length > 0){
          setError(`Missing Collumns. More in browser console`);
          console.log("To run make sure the csv has the column names: Nachname, Name, Zimmer Department, Role and id are necessary. id needs to be a number (without fhs at the beginning).")
          return;
        }

        setError(null);

        const bewohner = results.data as Bewohner[];
        setParsedData(bewohner);
        removeDB("Residents")
        addData("Urstein", bewohner, "Residents")
      },
    });
  };

  const searchChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const results = parsedData.filter((bewohner) =>
      bewohner.Zimmer.includes(event.target.value)
    ); 
    setFilterResult(results);
    setError(null)
  }

  async function loadFromDB() {
    try{
      const data = await getData("Urstein", "all", "Residents");

      if(Array.isArray(data) && data.length > 0){
        const finalisedData = data[data.length - 1] as Bewohner[];
        setParsedData(finalisedData);
      }
    } 
    catch (error){
      setError("Error:" + error);
    }
  }

  return (
    <div className='container'>
      <div className='inputElements'>
        {error && 
          <p className='error'>{error}</p>
        }
        <input
          type="file"
          name="file"
          accept=".csv"
          onChange={fileChangeHandler}
          className='uploader'
        />
        <button className="loader" onClick={loadFromDB}>Load from local database</button>
        <div className='splitter'></div>
        <input type='text' placeholder='Room number...' onChange={searchChangeHandler}></input>
      </div>
      <div className='resultsContainer'>
        {filteredData.map((bewohner) => (
          <div key={bewohner.Zimmer} className='result'>
            {bewohner.id != undefined && <a href={`mailto:fhs${bewohner.id}@fh-salzburg.ac.at`}>fhs{bewohner.id}</a>}
            <p>{escapeHtml(bewohner.Zimmer)}</p>
            <p>{escapeHtml(bewohner.Nachname)}</p>
            <p>{escapeHtml(bewohner.Name)}</p>
            <p>{escapeHtml(bewohner.Department)}</p>
            <p>{escapeHtml(bewohner.Role)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App
