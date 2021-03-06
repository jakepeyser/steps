//React&Redux
import React from 'react';
import Helmet from 'react-helmet';
import { browserHistory } from 'react-router'
//Stateless Components
import PlanOptions from './NewPlanOptions';
import NewTreatment from './NewTreatment';
import TreatmentsList from '../treatment/TreatmentsList';
import SidePanel from '../widgets/SidePanel';
import InfoItem from '../widgets/InfoItem';

//material-ui
import { StepsSelectField, StepsMenu, StepsMenuItem,
        StepsRaisedButton, StepsActionButton } from '../material-style';
import { FontIcon, Divider, Popover } from 'material-ui';
import { errorText } from '../colors';
import { fullName } from '../../utils';
import moment from 'moment';

// Initial Treatment Template for reseting
const initialTreatment = {
  time_per_exercise: '',
  reps: '',
  sets: '',
  resistance: '',
  notes: ''
};

const initialState = {
  duration : 0,
  therapyFocus : "",
  notes : "",
  exercisesOpen: false,
  selectedExercise : null,
  treatment: initialTreatment,
  treatments : [],
  treatmentErrors: {},
  planErrors: {}
};

//=======  Component==========
export default class NewPlan extends React.Component{
  constructor(props){
    super(props);
    console.log(this.props.plan)
    this.state = Object.keys(this.props.plan).length ? {
      duration: this.props.plan.duration,
      therapyFocus: this.props.plan.therapyFocus,
      notes: this.props.plan.notes,
      selectedExercise: null,
      treatment: initialTreatment,
      treatments: this.props.plan.treatments,
      planErrors: {},
      treatmentErrors: {}
    } : initialState

    this.handleChange = this.handleChange.bind(this);
    this.resistanceOnChange = this.resistanceOnChange.bind(this);
    this.treatmentHandler = this.treatmentHandler.bind(this);
    this.handleExercisesOpen = this.handleExercisesOpen.bind(this);
    this.handleExercisesClose = this.handleExercisesClose.bind(this);
    this.treatmentValidate = this.treatmentValidate.bind(this);
    this.planValidate = this.planValidate.bind(this);
    this.submitHandler = this.submitHandler.bind(this);
    this.addNewTreatment = this.addNewTreatment.bind(this);
    this.removeTreatment = this.removeTreatment.bind(this);
  }
//==== Plan Option Handlers
  // Update changed plan fields and reset errors
  handleChange(field, value) {
    let newState = {};
    newState[field] = value;
    if (this.state.planErrors[field]) {
      let newErrs = this.state.planErrors;
      delete newErrs[field]
      newState.planErrors = newErrs;
    }
    this.setState(newState);
  }

// handle change to resistance selector
  resistanceOnChange(evt, idx, value) {
    if (this.state.treatmentErrors['resistance']){
      let newErrs = this.state.treatmentErrors
      delete newErrs['resistance']
      newProperty.treatmentErrors = newErrs;
    }
    let newProperty = Object.assign({}, this.state.treatment, {resistance: value})
    this.setState({ treatment: newProperty })
  }

// Handler for this.state.treatments // all states within
  treatmentHandler(field, value) {
    let newProperty = {[field] : value}
    if (this.state.treatmentErrors[field]){
      let newErrs = this.state.treatmentErrors
      delete newErrs[field]
      newProperty.treatmentErrors = newErrs;
    }
    let newTreatment = Object.assign({}, this.state.treatment, newProperty); // merges old state with changes
    this.setState({ treatment : newTreatment });
  }

  // Exercise dropdown popover event handlers
  handleExercisesOpen(evt) {
    evt.preventDefault();
    console.log(evt);
    this.setState({
      exercisesOpen: true,
      anchorEl: evt.currentTarget
    });
  }
  handleExercisesClose() {
    this.setState({ exercisesOpen: false });
  }

  // Ensure the proper form fields are valid
  treatmentValidate() {
    let errs = {};
    if (!this.state.treatment.time_per_exercise) errs.time_per_exercise = 'This field is required';
    if (!this.state.treatment.reps) errs.reps = 'This field is required';
    if (!this.state.treatment.sets) errs.sets = 'This field is required';
    if (!this.state.treatment.resistance) errs.resistance = 'This field is required';
    return errs;
  }

  planValidate() {
    let errs = {};
    if (!this.state.duration) errs.duration = 'This field is required';
    if (!this.state.therapyFocus) errs.therapyFocus = 'This field is required';
    if (!this.state.treatments.length) errs.selectedExercise = 'You need to add at least one treatment';
    return errs;
  }

// ======= addNewTreatment Button==========
  addNewTreatment() {
    const errs = this.treatmentValidate();  // validate fields
    let newState;

    if (!Object.keys(errs).length) {  // if no errors, create treatment
      let treatment = {
        time_per_exercise: (this.state.treatment.time_per_exercise * 60),
        reps: this.state.treatment.reps,
        sets: this.state.treatment.sets,
        resistance: this.state.treatment.resistance,
        notes: this.state.treatment.notes,
        exercise_id: this.state.selectedExercise,
        patient_id: this.props.currentPatient.id
      };

      // Reset plan options and treatment form
      newState = {
        selectedExercise: null,
        treatment: initialTreatment,
        treatments: !this.state.treatments.length ?
          [ treatment ] : [ treatment, ...this.state.treatments ]
      };
    } else {
      console.error(errs) // if errors, console.log instead of creating treatment
      newState = { treatmentErrors: errs };
    }
    this.setState(newState)
  }

// ======= removeTreatment =======
  removeTreatment(idx) {
    let newTreatmentArray = this.state.treatments.filter((treatment,index)=> {
      if (idx !== index) return treatment;
    });
    this.setState({ treatments: newTreatmentArray});
  }

//===== SubmitHandler for Entire Plan ======
  submitHandler(evt) {
    evt.preventDefault();
    const errs = this.planValidate();   // validate fields
    if (!Object.keys(errs).length) {    // if no errors, create plan
      let newPlan = {
        duration : this.state.duration,
        therapyFocus : this.state.therapyFocus,
        notes : this.state.notes,
        patient_id: this.props.currentPatient.id,
        treatments: this.state.treatments
      };

      this.props.addPlan(newPlan);
      browserHistory.push(`/patients/${this.props.currentPatient.id}/plans/confirmation`)
    }
    else
      this.setState({ planErrors: errs });
  }

// -=-=-=-=-=-=-=-=-=-=-= Component Starts Here -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  render(){
    const { currentPatient, exercises } = this.props;
    return (
      <div id="new-plan">
        <Helmet title="New Plan" />
        <h1 className="page-header">New Plan</h1>
        <div className="new-plan-content">
          <SidePanel
            imgURL={currentPatient.img_URL}
            buttons={[
              <StepsRaisedButton
              type="submit"
              label="Create Plan"
              fullWidth={true}
              onClick={this.submitHandler} />
            ]}>
            <InfoItem icon="person" label="Name"
              content={ fullName(currentPatient) } />
            <InfoItem icon="fingerprint" label="Patient ID"
              content={ currentPatient.emr_id } />
            <InfoItem icon="event" label="DOB"
              content={ currentPatient.DOB ? moment(currentPatient.DOB).format('MMM Do, YYYY') : 'N/A' } />
            <InfoItem icon="assignment_ind" label="Gender"
              content={ currentPatient.gender ? currentPatient.gender : 'N/A' } />
          </SidePanel>
          <form className="new-plan-form" onSubmit={this.submitHandler}>
            <PlanOptions
              duration={this.state.duration}
              therapyFocus={this.state.therapyFocus}
              notes={this.state.notes}
              handleChange={this.handleChange}
              planErrors={this.state.planErrors}
            />
            {
              // Create exercise list dropdown, or else instruct therapist to create ones
              exercises.length ?
                <div className="add-exercise">
                  {
                    this.state.planErrors.selectedExercise ?
                      <p style={{ color: errorText }}>{this.state.planErrors.selectedExercise}</p>
                      : <p> Select an exercise </p>
                  }
                  <StepsActionButton onTouchTap={ this.handleExercisesOpen }>
                    <FontIcon className={'material-icons'}>add</FontIcon>
                  </StepsActionButton>
                </div> : <h4> Add Exercises to create Treatments </h4>
            }
            {
              // Render new treatment form, will not be visible if exercise null
              this.state.selectedExercise ?
                <NewTreatment
                  exercise={exercises.find(exercise => exercise.id === this.state.selectedExercise)}
                  treatment={this.state.treatment}
                  resistanceOnChange={this.resistanceOnChange}
                  addTreatment={this.addNewTreatment}
                  treatmentHandler={this.treatmentHandler}
                  treatmentErrors={this.state.treatmentErrors} /> : null
            }
            <hr />
            <div className="created-treatments">
              <h3> Created Treatments </h3>
              <TreatmentsList
                treatments={this.state.treatments}
                removeTreatment={this.removeTreatment} />
            </div>
          </form>
        </div>
        {/* Exercises list popover */}
        <Popover
          open={this.state.exercisesOpen}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{vertical: 'center', horizontal: 'middle'}}
          targetOrigin={{vertical: 'top', horizontal: 'right'}}
          onRequestClose={this.handleExercisesClose}>
          <StepsMenu maxHeight={200} value={this.state.selectedExercise}
            onItemTouchTap={(evt, item) => {
              this.handleChange('selectedExercise', item.props.value);
              this.handleExercisesClose();
            }}>
          {
            exercises.map(exercise =>
              <StepsMenuItem key={exercise.id}
                value={exercise.id} primaryText={exercise.title} />
            )
          }
          </StepsMenu>
        </Popover>
      </div>
    );
  }
}
