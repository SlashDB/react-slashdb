import './App.css';
import { useState } from 'react';
import { useSetUp, useDataDiscovery, useExecuteQuery } from '@slashdb/react-slashdb';

const SDBDemo = () => {

	const [values,updateField] = useState({'mintotal':20,'maxtotal':100});	// set defaults for SQL Pass-Thru query parameters
	const [filter,updateFilter] = useState({});
	
	
	// store values which are changed by user
	const handleUpdateField = (e, customerId) => {
		const col = e.target.name;
		if (customerId) {
			updateField( (values) => ({ ...values, [customerId]: { ...values[customerId], [col] : e.target.value }}) );
		}
		else {
			updateField( (values) =>  ( { ...values, [col] : e.target.value} ) );
		}
	}
	
	// useSetup parameters - SlashDB config
	const host = "https://demo.slashdb.com";	// set SlashDB host here
	const username = null;	// set SlashDB username here
	const apiKey = null;	// set SlashDB API key here
	
	// useSetup hook - useDataDiscovery/useExecuteQuery cannot run until this hook has been executed
	useSetUp('default', host, username, apiKey);
	
	// useDataDiscovery parameters
	const database = "Chinook";
	const resource = "Customer";
	// useDataDiscovery hook - interact with a database resource in the SlashDB instance configured with useSetup hook
	const [resourceData, getResource, postResource, putResource, deleteResource] = useDataDiscovery(database, resource);

	// useExecuteQuery parameters
	const queryName = "invoices-total-range";
	const defaultParams = 'mintotal/20/maxtotal/100';
	// useExecuteQuery hook - interact with a query that is configured in the SlashDB instance configured with useSetup hook
	const [queryData, execQuery] = useExecuteQuery(queryName, defaultParams);



	// sample PUT usage with filter - updates customer fields
	const updateRecord = async (e) => {
		if (values[e.target.value]) {
			const filterDef = `CustomerId/${e.target.value}`;	// create a SlashDB-compatible filter
			document.querySelector(`td#customer${e.target.value}`).innerHTML = `Working...`;
			try { 
				await putResource(filterDef, values[e.target.value]);
				document.querySelector(`td#customer${e.target.value}`).innerHTML = `Updated`;

				// stop tracking changes to the row once the row values have been updated
				updateField( (values) => {
					delete values[e.target.value];
					return values;
				});
			}
			catch(error) {
				document.querySelector(`td#customer${e.target.value}`).innerHTML = `Error updating`;				
			}
		}
	}

	// sample GET usage with wildcard filter 
	const filterResults = async (e) => {
		const col = e.target.name;
		const val = e.target.value;
		const updatedFilter = {...filter, [col]:val};

		// handle null filter values
		if (! e.target.value) {
			console.log(e.target.value)
			delete(updatedFilter[col]);
		}

		let filterString = '';
		for (const f in updatedFilter) {
			filterString += `${f}/${updatedFilter[f]}*/`;	// create SlashDB-compatible filter
		}
		
		filterString = filterString.slice(0,filterString.length-1); // chop the trailing '/'
		try { 
			await getResource(filterString);
			updateFilter(updatedFilter); 		// store the updated filter state
		}
		catch(error) {
			console.log(error);
		}
	}	

	
	//  data retrieval
	let resourceTable = resourceData.map( record => {
		return (
			<tr key={record.CustomerId}>
				<td><input type="text" name="FirstName" defaultValue={record.FirstName} onChange={e => handleUpdateField(e, record.CustomerId)}/></td>
				<td><input type="text" name="LastName" defaultValue={record.LastName} onChange={e => handleUpdateField(e, record.CustomerId)}/></td>
				<td><input type="text" name="City" defaultValue={record.City} onChange={e => handleUpdateField(e, record.CustomerId)}/></td>
				<td><input type="text" name="State" defaultValue={record.State} onChange={e => handleUpdateField(e, record.CustomerId)}/></td>
				<td><input type="text" name="Country" defaultValue={record.Country} onChange={e => handleUpdateField(e, record.CustomerId)}/></td>					
				<td><button value={record.CustomerId} onClick={e => updateRecord(e)}>Update Record</button></td>
				<td id={`customer${record.CustomerId}`}></td>
			</tr>
		);
	})
	
	// get query parameters and execute query
	const fireQuery = (e) => {
		const mintotal = values['mintotal'];
		const maxtotal = values['maxtotal'];
		const filterDef = `mintotal/${mintotal}/maxtotal/${maxtotal}`;	// SlashDB-compatible filter
		execQuery(filterDef);
	}	

	
	let queryTable = queryData.map( (record, i) => {
		return (
			<tr key={i}>
				<td>{record.InvoiceId}</td>
				<td>{record.CustomerId}</td>
				<td>{record.InvoiceDate}</td>
				<td>{record.BillingAddress}</td>
				<td>{record.BillingCity}</td>
				<td>{record.BillingState}</td>
				<td>{record.BillingCountry}</td>
				<td>{record.BillingPostalCode}</td>
				<td>{record.Total}</td>
			</tr>
		);
	})	
	
	return (
		<div>
			<h3>Data Discovery - {database} Database - {resource} Data Table</h3>
			<table style={{ margin: '40px auto', display: 'inline-block', height: '300px', minWidth:'66%', overflowY: 'auto'}}>
				<thead style={{ marginTop: '-55px', position: 'absolute'}}>
					<tr>
						<th>FirstName</th>
						<th>LastName</th>
						<th>City</th>						
						<th>State</th>						
						<th>Country</th>												
					</tr>
					<tr>
						<th><input type="text" name="FirstName" onChange={e => filterResults(e)} /></th>
						<th><input type="text" name="LastName" onChange={e => filterResults(e)} /></th>
						<th><input type="text" name="City" onChange={e => filterResults(e)} /></th>						
						<th><input type="text" name="State" onChange={e => filterResults(e)} /></th>						
						<th><input type="text" name="Country" onChange={e => filterResults(e)} /></th>
						<th>Filter</th>
					</tr>
				</thead>
				<tbody style={{ marginTop: '30px'}}>
					{resourceTable}
				</tbody>
			</table>
			
			<h3>SQL Pass-Thru - Invoices Total Range Query</h3>
			<div>
				<label style={{margin: '10px'}}>Min Total </label>
				<input type="text" name="mintotal" defaultValue="20" onChange={e => handleUpdateField(e)} />
				<label style={{margin: '10px'}}>Max Total </label>
				<input type="text" name="maxtotal" defaultValue="100" onChange={e => handleUpdateField(e)} />
				<button style={{margin: '10px'}} onClick={e => fireQuery()}>Execute Query</button>
			</div>
			<table style={{ margin: '30px auto', display: 'inline-block', height: '300px', overflowY: 'auto'}}>
				<thead>
					<tr key="sqlheader">
						<th key="invoiceId">InvoiceId</th>
						<th key="customerId">CustomerId</th>
						<th key="invoiceDate">InvoiceDate</th>						
						<th key="billingAddress">BillingAddress</th>						
						<th key="billingCity">BillingCity</th>												
						<th key="billingState">BillingState</th>		
						<th key="billingCountry">BillingCountry</th>		
						<th key="billingPostalCode">BillingPostalCode</th>		
						<th key="total">Total</th>
					</tr>
				</thead>
				<tbody>
					{queryTable}
				</tbody>
			</table>
			
		</div>
	);
}

function App() {
  return (
    <div className="App">
		<h4>SlashDB React Demo Application</h4>
		<SDBDemo></SDBDemo>
    </div>
  );
}

export default App;
