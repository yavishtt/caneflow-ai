# Experiment 7 traceability

Source: `EXP_7_Test_Case_Black_Box_2026.pdf`. Each row is an executable, identified case in `src/test/experiment7.test.ts`; assertions check outputs against the written expected behavior.

| ID | Scenario | Expected result |
| --- | --- | --- |
| ECP-01 | SM −5 | Invalid, alert, no recommendation |
| ECP-02 | SM 15, RF 0, PA 8 | Positive irrigation duration within power window |
| ECP-03 | SM 50 | No irrigation; next evaluation cycle |
| ECP-04 | SM 85 | No irrigation; saturation warning |
| ECP-05 | SM 120 | Invalid, alert, no recommendation |
| ECP-06 | SM null | Missing data, farmer and supervisor alert |
| ECP-07 | RF −3 | Forecast rejected |
| ECP-08 | RF 5 | Light rain ignored; irrigate |
| ECP-09 | RF 40 | Skip irrigation; rainfall advisory |
| ECP-10 | RF 500 | Forecast rejected |
| BVA-01 | SM −1 | Reject |
| BVA-02 | SM 0 | Irrigate |
| BVA-03 | SM 1 | Irrigate |
| BVA-04 | SM 29 | Irrigate |
| BVA-05 | SM 30 | Adequate; no irrigation |
| BVA-06 | SM 31 | Adequate; no irrigation |
| BVA-07 | SM 70 | Adequate; no irrigation |
| BVA-08 | SM 71 | Saturation warning; no irrigation |
| BVA-09 | SM 100 | Saturation warning; no irrigation |
| BVA-10 | SM 101 | Reject |
| BVA-11 | RF −1 | Reject |
| BVA-12 | RF 0 | Irrigate |
| BVA-13 | RF 9 | Irrigate |
| BVA-14 | RF 10 | Skip; rainfall advisory |
| BVA-15 | RF 200 | Valid; skip irrigation |
| BVA-16 | RF 201 | Reject |
| BVA-17 | PA −1 | Reject |
| BVA-18 | PA 0 | Defer to next power window; alert farmer |
| BVA-19 | PA 24 | Duration fits the day |
| BVA-20 | PA 25 | Reject |
| DT-01 | Low SM, no rain, power | Irrigate |
| DT-02 | Low SM, no rain, no power | Defer; alert |
| DT-03 | Low SM, rain, power | Skip; rain advisory |
| DT-04 | Low SM, rain, no power | Skip; rain advisory |
| DT-05 | Adequate SM, no rain, power | No irrigation |
| DT-06 | Adequate SM, no rain, no power | No irrigation |
| DT-07 | Adequate SM, rain, power | No irrigation; rain noted |
| DT-08 | Adequate SM, rain, no power | No irrigation; rain noted |
| EG-01 | 24-hour sensor silence | Communication alert, farmer/supervisor recipients; stale reading withheld |
| EG-02 | SM 20 → 95 | Noisy flag; recommendation withheld |
| EG-03 | Weather service unavailable | Reliability alert; recommendation withheld |
| EG-04 | Agronomist duration override | Override stored; farmer gets new duration; audit entry |
| EG-05 | Four languages in turn | Same action/duration; distinct localized text |
| EG-06 | Tamil selected | Rejection listing the four supported languages |
| EG-07 | Farmer opens another farmer's plot | Access denied and audited |

Baseline unless overridden: SM 15%, RF 0 mm, PA 8 h, current reading, working weather service, English. Every irrigate case also checks a positive duration bounded by its available power window. Every blocked case checks alert presence, zero duration and no schedule. Saturated, adequate, deferred and rain cases check their respective warning/message/output.

## SRS alignment

| Requirement | Implementation | Verification |
| --- | --- | --- |
| REQ-1: plot-specific irrigation and rainfall adjustment | Advisory engine + Test lab + agronomist/farmer views | ECP, BVA, DT |
| REQ-2: power, multilingual advice, expert review/override | Language templates, approval workflow, farmer controls | DT, EG-04/05/06, workflow and UI tests |
| 4.1.3: unreliable data and communications | Missing/noisy/stale/weather flags | ECP-06, EG-01/02/03 |
| 5.5: role and plot scope | Shared access functions and plot selectors | EG-07, additional role tests |
| Audit and feedback | Local action records, expert reasons, farmer observations | EG-04/07, workflow/UI checks |

Tests verify the frontend demonstration and shared local domain logic. They do not certify external systems, actual trained AI, hardware, SMS delivery, production authorization, load performance, or DPDP compliance.
