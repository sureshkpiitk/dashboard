import React, { useState, useEffect } from "react";
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import "./App.css";

function HelloWorld() {
    function handleClick() {

        // Using fetch to fetch the api from
        // flask server it will be redirected to proxy
        fetch("http://localhost:5000/hello-world/?user_id=125").then((res) =>
            res.json().then((data) => {
                // Setting a data from api
                console.log(data)
                return data

            })
        );

    }

    return (
        <button onClick={handleClick}>
            Hello World
        </button>
    );
}

function App() {
    // usestate for setting a javascript
    // object for storing and using data
    const [uniqueUser, setuniqueUser] = useState(0);
    const [totalCall, settotalCall] = useState(0)
    const [totalfailCall, settotalfailCall] = useState(0)
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [logData, setLogData] = useState()

    const handleSelect = (date) => {
        setStartDate(date.selection.startDate);
        setEndDate(date.selection.endDate);
    };


    const selectionRange = {
        startDate: startDate,
        endDate: endDate,
        key: 'selection',
    }

    function Rows(table_arr) {
        console.log("tabbbbbbbbbbbbbble", table_arr)
        let v;
        if (table_arr.length != 0) {
            console.log("getting arr")
            for (let index = 0; index < table_arr.length; index++) {
                const val = table_arr[index];
                v += (<div key={val._id}>
                    <div>{val._id}</div>
                    <div>{val.user_id}</div>
                    <div>{val.status}</div>
                </div>)
            }

        }
        console.log("objjj", v)
        return v
    }

    function Table(table_arr) {


        return <div className="main-container">
            <div>
                <div className="tableRow">
                    <div>
                        <div>Name</div>
                        <div>Age</div>
                        <div>Gender</div>
                    </div>
                </div>
                {Rows(table_arr)}
            </div>
        </div>
    }



    function handleFilterButton() {
        console.log(startDate)
        const start_date = startDate.toLocaleDateString() + "T" + startDate.toLocaleTimeString()
        const end_time = endDate.toLocaleDateString() + "T" + endDate.toLocaleTimeString()
        fetch("http://127.0.0.1:5000/filter/?start_time=" + start_date + "&end_time=" + end_time).then((res) =>
            res.json().then((data) => {
                console.log(data)
                setuniqueUser(data.unique_user)
                settotalCall(data.total_call)
                console.log(data.user_data)
                setLogData(data.user_data)
                return Table(data.user_data)

            })
        );
    }

    function FilterData() {

        return <button onClick={handleFilterButton}>
            Filter data
        </button>
    }


    return (
        <div className="App">
            <header className="App-header">

                <h1>React and flask</h1>
                <HelloWorld />
                <DateRangePicker
                    ranges={[selectionRange]}
                    onChange={handleSelect}
                />
                <FilterData />

                <h2>Unique_user: {uniqueUser} </h2>
                <h3>Total Call: {totalCall} </h3>
                <h3> Total fail Call: {totalfailCall} </h3>
                <Table table_arr={logData}></Table>

            </header>
        </div>
    );
}

export default App;
