# Test results

| ID | Test | Expected | Result |
|---|---|---|---|
| TC-01 | Register with valid inputs | Account and profile created | Pass |
| TC-02 | Register with invalid email | Validation error | Pass |
| TC-03 | Log in and refresh | Session remains active | Pass |
| TC-04 | Open dashboard signed out | Redirect to login | Pass |
| TC-05 | Create project | Project persists after refresh | Pass |
| TC-06 | Update project as member | Operation denied | Pass |
| TC-07 | Add existing member | Member sees project | Pass |
| TC-08 | Add unknown user | Clear error; no invalid membership | Pass |
| TC-09 | Create task without title | Validation prevents save | Pass |
| TC-10 | Change task status | Correct state persists | Pass |
| TC-11 | Filter high-priority tasks | Only matching tasks shown | Pass |
| TC-12 | Search title keyword | Correct matching tasks shown | Pass |
| TC-13 | Open foreign project URL | No data disclosed | Pass |
| TC-14 | Attempt forbidden Firestore write | Security rules reject operation | Pass |
| TC-15 | Mobile width 375px | No broken or clipped core controls | Pass |
| TC-16 | Simulate network failure | Visible error and no false success | Pass |