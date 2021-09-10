import React from "react";
import * as CSS from "csstype";
import axios from "axios";
import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch,
  useParams,
} from "react-router-dom";
import { Button, Divider, Header, Container, Icon } from "semantic-ui-react";

import { apiBaseUrl } from "./constants";
import { useStateValue, setPatientList, updatePatient, setDiagnosisList } from "./state";
import { Diagnosis, Patient, Entry, HospitalEntry, OccupationalHealthcareEntry, HealthCheckEntry } from "./types";

import PatientListPage from "./PatientListPage";

const borderStyle: CSS.Properties<string | number> = {
  borderWidth: 2,
  borderColor: 'rgba(128, 128, 128, 1)',
  borderStyle: 'solid',
  padding: 10,
  margin: 10,
};

const Hospital = ({ entry }: { entry: HospitalEntry }) => {
  return (
    <Container style={borderStyle}>
      <Header as="h3">
        {entry.date} <Icon name="hospital" />
      </Header>
      <p>{entry.description}</p>
      <Header as="h4">
        Discharged on {entry.discharge.date}: {entry.discharge.criteria}
      </Header>
    </Container>
  );
};

const heartColor = (rating: number) => {
  if (rating === 0) {
    return "green";
  } else if (rating === 1) {
    return "yellow";
  } else if (rating === 2) {
    return "orange";
  } else {
    return "red";
  }
};

const HealthCheck = ({ entry }: { entry: HealthCheckEntry }) => {
  return (
    <Container style={borderStyle}>
      <Header as="h3">
        {entry.date} <Icon name="heartbeat" />
      </Header>
      <p>{entry.description}</p>
      <Icon className={`${heartColor(entry.healthCheckRating)} heart`}/>
    </Container>
  );
};

const OccupationalHealthcare = ({ entry }: { entry: OccupationalHealthcareEntry }) => {
  return (
    <Container style={borderStyle}>
      <Header as="h3">
        {entry.date} <Icon name="doctor" /> {entry.employerName}
      </Header>
      <p>{entry.description}</p>
    </Container>
  );
};

const assertNever = (value: never): never => {
  throw new Error(
    `Unhandled discriminated union member: ${JSON.stringify(value)}`
  );
};

const EntryDetails: React.FC<{ entry: Entry }> = ({ entry }) => {
  switch (entry.type) {
    case "Hospital":
      return <Hospital entry={entry}/>;
    case "HealthCheck":
      return <HealthCheck entry={entry}/>;
    case "OccupationalHealthcare":
      return <OccupationalHealthcare entry={entry}/>;
    default:
      return assertNever(entry);
  }
};

const PatientView = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [{ patients, diagnoses }, dispatch] = useStateValue();
  const { id } = useParams<{ id: string }>();

  React.useEffect(() => {
    const fetchPatient = async () => {
      try {
        const { data: patient } = await axios.get<Patient>(
          `${apiBaseUrl}/patients/${id}`
        );
        dispatch(updatePatient(patient));
        console.log("Fetched!");
      } catch (e) {
        console.error(e);
      }
    };
    void fetchPatient();
  }, [dispatch, id]);

  console.log(patients[id]);

  const patient = patients[id];
  const iconName = patient.gender == "other" ? "other gender" : patient.gender;

  if (patient) {
    return (
      <Container>
        <Header as="h2">
          {patient.name}
          <Icon name={iconName} />
        </Header>
        <p>SSN: {patient.ssn}</p>
        <p>Date of Birth: {patient.dateOfBirth}</p>
        <p>Occupation: {patient.occupation}</p>
        <br></br>
        <Header as="h3">Patient Entries</Header>
        <div>
          {patient.entries.map((entry) => (
            <EntryDetails key={entry.id} entry={entry}/>
          ))}
        </div>
      </Container>
    );
  }
  return <div>No info available</div>;
};

const App = () => {
  const [, dispatch] = useStateValue();
  React.useEffect(() => {
    void axios.get<void>(`${apiBaseUrl}/ping`);

    const fetchPatientList = async () => {
      try {
        const { data: patientListFromApi } = await axios.get<Patient[]>(
          `${apiBaseUrl}/patients`
        );
        dispatch(setPatientList(patientListFromApi));
      } catch (e) {
        console.error(e);
      }
    };

    const fetchDiagnosisList = async () => {
      try {
        const { data: diagnosisListFromApi } = await axios.get<Diagnosis[]>(
          `${apiBaseUrl}/diagnoses`
        );
        dispatch(setDiagnosisList(diagnosisListFromApi));
      } catch (e) {
        console.error(e);
      }
    };
    void fetchPatientList();
    void fetchDiagnosisList();
  }, [dispatch]);

  return (
    <div className="App">
      <Router>
        <Container>
          <Header as="h1">Patientor</Header>
          <Button as={Link} to="/" primary>
            Home
          </Button>
          <Divider hidden />
          <Switch>
            <Route path="/:id">
              <PatientView />
            </Route>
            <Route path="/">
              <PatientListPage />
            </Route>
          </Switch>
        </Container>
      </Router>
    </div>
  );
};

export default App;
