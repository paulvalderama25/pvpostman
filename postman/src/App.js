import {useState, useEffect} from "react";
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';


function App() {
    const [user, setUser] = useState({});
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [displaySearh, setDisplaySearch] = useState([]);
    const [searchSubmitted, setSearchSubmitted] = useState(false);
    const [noResultFound, setNoResultFound] = useState(false);
    // const [resultFound, setResultFound] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(false);
    const [editedCustomerDetails, setEditedCustomerDetails] = useState({})
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [id, setId] = useState(0);
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newId, setNewId] = useState(null);
    const [loggedIn, setLoggedIn] = useState(false);

    function handleCallbackResponse(response) {

        var userObject = jwtDecode(response.credential);
        setLoggedIn(true);
        setUser(userObject);
        document.getElementById("signInDiv").hidden = true;
    }

    function handleSignOut(event) {
        setUser({});
        setLoggedIn(false);
        document.getElementById("signInDiv").hidden = false;
    }

    useEffect(() => {
        /* global google */
        google.accounts.id.initialize({
            client_id: "955568137419-b1hsm5gmouemhhr25s1l9op6hu8b8ajj.apps.googleusercontent.com",
            callback: handleCallbackResponse
        })
        google.accounts.id.renderButton(
            document.getElementById("signInDiv"),
            {theme: "outline", size: "large"}
        );

        google.accounts.id.prompt();
    }, []);


    const handleNewCustomer = (e) => {
        e.preventDefault();

        axios({
            method: 'post',
            url:'/postData',
            data:{
                name: newName,
                email: newEmail,
                id: newId
            }
        })
        getCustomers();
        setNewName('');
        setNewId(0);
        setNewEmail('');
    }
    const editCustomer = (id, name, email) => {
        setEditingCustomer(true);
        setNoResultFound(false);
        setSearchSubmitted(false);
        setName(name);
        setEmail(email);
        setId(id);
        // setEditedCustomerDetails({
        //     "name": name,
        //     "email": email,
        //     "id": id
        // })
    }

    const deleteCustomer = (e, id) => {
        e.preventDefault();

        axios.delete('/delete/' + id)
            .then((res, err) => {
                console.log(res)
        })
            .catch((error) => {
            console.log(error)
        })

        setNoResultFound(false);
        setSearchSubmitted(false);
        setEditingCustomer(false);
        getCustomers();
        setSearch('');
    }

    const handleEditSubmit = (e) => {
        e.preventDefault();
        axios.put('/update/' + id, {name, email})
            .then((res, err) => {
                if(res.data) {
                    console.log('updated')
                } else {
                    console.log(err, 'customer not updated')
                }
            })
        setEditingCustomer(false);
        setNoResultFound(false);
        setSearchSubmitted(false);
        setSearch('');
    }

    const submitSearch = () => {
        setSearchSubmitted(true);
        setSearch('');
        setEditingCustomer(false);
    }

    const displayAllCustomers = () => {
        setSearchSubmitted(false);
        setSearchResults([]);
        setNoResultFound(false);
    }
    function getCustomers() {
        fetch('/fetchData')
            .then(response => response.json())
            // .then(data => console.log(data))
            .then(data => {
                console.log(data)
                setCustomers(data)
            })
            .catch(error => console.error(error))
    }

    const handleChange = (event) => {

        setSearch(event.target.value);
        const filterCustomers = customers.filter((item) => {
            if (item.id === Number(event.target.value)){
                // setResultFound(true);
                console.log(item, 'item in handle')
                return item;
            }
        });
        if(filterCustomers.length > 0){
            console.log(filterCustomers, 'hitting filter')
            setSearchResults(filterCustomers[0]);
            setNoResultFound(false);
            setSearchSubmitted(true);
        } else {
            setSearchResults([]);
            setSearchSubmitted(false);
            setNoResultFound(true);
        }
        console.log(searchSubmitted,'search sub')
    }

    useEffect(() => {
        getCustomers();
    }, [editingCustomer, noResultFound]);

    // useEffect(() => {
    //     setDisplaySearch(searchResults)
    // }, [searchResults])

    return (
    <div className="App">
        <div id="signInDiv"></div>
        { Object.keys(user).length != 0 &&
            <button className="sign-out-btn" onClick={(e) => handleSignOut(e)}>Sign Out</button>
        }

        {loggedIn ?
            <div>
                <div>
                    <img alt={'No Image'} src={user.picture}></img>
                    <h3>{user.name}</h3>
                </div>

                <p>Search for Customer by ID</p>
                <div>
                  <input
                    type='text'
                    value={search}
                    onChange={handleChange}
                  />
                  <button
                    onClick={submitSearch}
                    style={{marginLeft:'5px', marginRight:'5px'}}
                  >Submit</button>
                    <button
                        onClick={displayAllCustomers}
                    >Display All Customers
                    </button>
                </div>
                <div>
                    <p>Enter New Customer</p>
                    Name
                    <input
                        value={newName}
                        onChange={(e) => {setNewName(e.target.value)}}
                        style={{marginRight: '5px', marginLeft: '5px'}}
                    />
                    Email
                    <input
                        value={newEmail}
                        onChange={(e) => {setNewEmail(e.target.value)}}
                        style={{marginRight: '5px', marginLeft: '5px'}}
                    />
                    ID
                    <input
                        value={newId}
                        onChange={(e) => {setNewId(e.target.value)}}
                        placeholder={''}
                        style={{marginRight: '5px', marginLeft: '5px'}}
                    />
                    <button
                        onClick={(e) => {handleNewCustomer(e)}}
                    >Submit New Customer</button>
                </div>
                <div>
                    {searchSubmitted ?
                        <p className="customer-title">Searched Customer</p>
                        :
                        <p className="customer-title" key={'customer'}>Customers</p>
                    }
                </div>
                <div className='result-list'>
                    { searchSubmitted && !noResultFound ?
                        // { searchSubmitted && !noResultFound && !editingCustomer ?
                        <ul>
                            <li key={"name"}>Name: {searchResults.name}</li>
                            <li key={'email'}>Email: {searchResults.email}</li>
                            <li key={'id'}>ID: {searchResults.id}</li>
                            <button
                                onClick={() => {editCustomer(searchResults.id, searchResults.name, searchResults.email)}}
                            >edit
                            </button>
                            <button
                                onClick={(e) => {deleteCustomer(e, searchResults.id)}}
                            >delete</button>
                        </ul>

                        : noResultFound && searchSubmitted && !editingCustomer ?
                            <p>No Result Found</p>
                            : !searchSubmitted && !noResultFound &&  editingCustomer?
                                <span>
                                    Name:
                                    <input
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                    />
                                    Email:
                                    <input
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                    />
                                    <button
                                        onClick={handleEditSubmit}
                                    >Submit Edit</button>
                                </span>
                        : customers.map((item, index) => (
                            <ul>
                                <li key={"name"}>Name: {item.name}</li>
                                <li key={'email'}>Email: {item.email}</li>
                                <li key={'id'}>ID: {item.id}</li>
                            </ul>
                        ))

                }
                </div>
            </div>
            : <></>
        }
    </div>
  );
}

export default App;
