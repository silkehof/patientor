import React from "react";
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
import { useStateValue, setPatientList, updatePatient } from "./state";
import { Patient } from "./types";

import PatientListPage from "./PatientListPage";

const PatientView = () => {
  const [{ patients }, dispatch] = useStateValue();
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
  const iconName =
    patient.gender == "other"
      ? "other gender" : patient.gender;

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
    void fetchPatientList();
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
