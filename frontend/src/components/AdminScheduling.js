import React, { useEffect, useState } from "react";
import { Navbar } from "./Navbar";
import { getAuthToken } from "../helpers/axios_helper";
import "../style/AdminScheduling.css";

const algorithmLabels = {
    FCFS: "FCFS",
    ROUND_ROBIN: "Round Robin",
    PRIORITY: "Priority Scheduling"
};

const algorithmDescriptions = {
    FCFS: "Cererea este aprobată în ordinea sosirii, în limita regulilor de capacitate.",
    ROUND_ROBIN: "Intervalele sunt împărțite în sloturi egale; dacă intervalul complet nu încape, se alocă primul slot liber compatibil.",
    PRIORITY: "Cererea intră în așteptare și este evaluată după regulile de prioritate configurate pentru tipurile de eveniment."
};

const createDefaultPriorityRules = () => ([
    { eventType: "EXAMEN", priority: 1 },
    { eventType: "CURS", priority: 2 },
    { eventType: "EVENIMENT", priority: 3 }
]);

function AdminScheduling() {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const { role } = storedUser || {};
    const [roomConfigs, setRoomConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingRoomId, setSavingRoomId] = useState(null);
    const [feedback, setFeedback] = useState({ type: "", message: "" });

    const normalizeConfig = (room) => ({
        ...room,
        roundRobinSlotMinutes: room.roundRobinSlotMinutes ?? 120,
        eventPriorityRules: room.eventPriorityRules?.length
            ? room.eventPriorityRules.map(rule => ({ ...rule }))
            : createDefaultPriorityRules()
    });

    useEffect(() => {
        const fetchConfigs = async () => {
            try {
                const token = getAuthToken();
                const response = await fetch("http://localhost:8080/api/v1/rooms/admin/scheduling", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error("Nu am putut încărca configurațiile de scheduling.");
                }

                const data = await response.json();
                setRoomConfigs(data.map(normalizeConfig));
            } catch (error) {
                setFeedback({ type: "danger", message: error.message });
            } finally {
                setLoading(false);
            }
        };

        fetchConfigs();
    }, []);

    const updateRoomField = (roomId, field, value) => {
        setRoomConfigs(previous =>
            previous.map(room =>
                room.roomId === roomId
                    ? {
                        ...room,
                        [field]: field === "roundRobinSlotMinutes"
                            ? (value === "" ? "" : Number(value))
                            : value
                    }
                    : room
            )
        );
    };

    const updatePriorityRule = (roomId, ruleIndex, field, value) => {
        setRoomConfigs(previous =>
            previous.map(room => {
                if (room.roomId !== roomId) {
                    return room;
                }

                return {
                    ...room,
                    eventPriorityRules: room.eventPriorityRules.map((rule, index) =>
                        index === ruleIndex
                            ? {
                                ...rule,
                                [field]: field === "priority" ? (value === "" ? "" : Number(value)) : value
                            }
                            : rule
                    )
                };
            })
        );
    };

    const addPriorityRule = (roomId) => {
        setRoomConfigs(previous =>
            previous.map(room =>
                room.roomId === roomId
                    ? {
                        ...room,
                        eventPriorityRules: [...room.eventPriorityRules, { eventType: "", priority: room.eventPriorityRules.length + 1 }]
                    }
                    : room
            )
        );
    };

    const removePriorityRule = (roomId, ruleIndex) => {
        setRoomConfigs(previous =>
            previous.map(room =>
                room.roomId === roomId
                    ? {
                        ...room,
                        eventPriorityRules: room.eventPriorityRules.filter((_, index) => index !== ruleIndex)
                    }
                    : room
            )
        );
    };

    const handleAlgorithmChange = (roomId, nextAlgorithm) => {
        setRoomConfigs(previous =>
            previous.map(room => {
                if (room.roomId !== roomId) {
                    return room;
                }

                return {
                    ...room,
                    schedulingAlgorithm: nextAlgorithm,
                    roundRobinSlotMinutes: nextAlgorithm === "ROUND_ROBIN" ? (room.roundRobinSlotMinutes || 120) : null,
                    eventPriorityRules: nextAlgorithm === "PRIORITY"
                        ? (room.eventPriorityRules?.length ? room.eventPriorityRules.map(rule => ({ ...rule })) : createDefaultPriorityRules())
                        : []
                };
            })
        );
    };

    const validatePriorityRules = (rules) => {
        if (!rules.length) {
            return "Pentru Priority Scheduling trebuie să existe cel puțin o regulă.";
        }

        const normalizedTypes = new Set();
        for (const rule of rules) {
            const eventType = (rule.eventType || "").trim().toUpperCase();
            if (!eventType) {
                return "Fiecare regulă trebuie să aibă un tip de eveniment.";
            }
            if (!rule.priority || Number(rule.priority) < 1) {
                return "Fiecare regulă trebuie să aibă o prioritate mai mare sau egală cu 1.";
            }
            if (normalizedTypes.has(eventType)) {
                return "Tipurile de eveniment trebuie să fie unice.";
            }
            normalizedTypes.add(eventType);
        }

        return null;
    };

    const saveConfiguration = async (room) => {
        setSavingRoomId(room.roomId);
        setFeedback({ type: "", message: "" });

        try {
            if (room.schedulingAlgorithm === "PRIORITY") {
                const validationError = validatePriorityRules(room.eventPriorityRules);
                if (validationError) {
                    throw new Error(validationError);
                }
            }

            const token = getAuthToken();
            const response = await fetch(`http://localhost:8080/api/v1/rooms/admin/scheduling/${room.roomId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    schedulingAlgorithm: room.schedulingAlgorithm,
                    roundRobinSlotMinutes: room.schedulingAlgorithm === "ROUND_ROBIN" ? room.roundRobinSlotMinutes : null,
                    eventPriorityRules: room.schedulingAlgorithm === "PRIORITY"
                        ? room.eventPriorityRules.map(rule => ({
                            eventType: rule.eventType.trim().toUpperCase(),
                            priority: Number(rule.priority)
                        }))
                        : []
                })
            });

            const payload = await response.json();
            if (!response.ok) {
                throw new Error(payload.error || "Configurarea nu a putut fi salvată.");
            }

            setRoomConfigs(previous =>
                previous.map(existing => existing.roomId === room.roomId ? normalizeConfig(payload) : existing)
            );
            setFeedback({ type: "success", message: `Configurarea pentru ${room.roomName} a fost salvată.` });
        } catch (error) {
            setFeedback({ type: "danger", message: error.message });
        } finally {
            setSavingRoomId(null);
        }
    };

    if (role !== "ADMIN") {
        return (
            <div className="Reservation">
                <Navbar />
                <div className="background-home admin-scheduling-page">
                    <div className="admin-scheduling-shell">
                        <div className="alert alert-danger mb-0">Pagina este disponibilă doar administratorilor.</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="Reservation">
            <Navbar />
            <div className="background-home admin-scheduling-page">
                <div className="admin-scheduling-shell">
                    <div className="admin-scheduling-hero">
                        <div>
                            <span className="admin-scheduling-kicker">Control administrativ</span>
                            <h1>Meniu de configurare scheduling</h1>
                            <p>Alege algoritmul potrivit pentru fiecare sală și, pentru sălile care folosesc Priority Scheduling, definește explicit regulile de prioritate ale evenimentelor.</p>
                        </div>
                        <div className="admin-scheduling-summary">
                            <strong>{roomConfigs.length}</strong>
                            <span>săli configurabile</span>
                        </div>
                    </div>

                    {feedback.message && (
                        <div className={`alert alert-${feedback.type}`}>{feedback.message}</div>
                    )}

                    {loading ? (
                        <div className="card p-4">Se încarcă configurațiile...</div>
                    ) : (
                        <div className="admin-scheduling-grid">
                            {roomConfigs.map(room => (
                                <section className="admin-scheduling-card" key={room.roomId}>
                                    <div className="admin-scheduling-card-top">
                                        <div>
                                            <span className="admin-room-type">{room.roomType}</span>
                                            <h2>{room.roomName}</h2>
                                        </div>
                                        <span className="admin-room-badge">{algorithmLabels[room.schedulingAlgorithm] || room.schedulingAlgorithm}</span>
                                    </div>

                                    <div className="admin-scheduling-field">
                                        <label>Algoritm activ</label>
                                        <select
                                            className="form-select"
                                            value={room.schedulingAlgorithm}
                                            onChange={(event) => handleAlgorithmChange(room.roomId, event.target.value)}
                                        >
                                            {room.allowedAlgorithms.map(algorithm => (
                                                <option key={algorithm} value={algorithm}>
                                                    {algorithmLabels[algorithm] || algorithm}
                                                </option>
                                            ))}
                                        </select>
                                        <small>{algorithmDescriptions[room.schedulingAlgorithm]}</small>
                                    </div>

                                    {room.schedulingAlgorithm === "ROUND_ROBIN" && (
                                        <div className="admin-scheduling-field">
                                            <label>Dimensiune slot Round Robin (minute)</label>
                                            <input
                                                type="number"
                                                min="60"
                                                step="60"
                                                className="form-control"
                                                value={room.roundRobinSlotMinutes ?? ""}
                                                onChange={(event) => updateRoomField(room.roomId, "roundRobinSlotMinutes", event.target.value)}
                                            />
                                        </div>
                                    )}

                                    {room.schedulingAlgorithm === "PRIORITY" && (
                                        <div className="admin-scheduling-field">
                                            <label>Reguli de prioritate</label>
                                            <div className="priority-rule-list">
                                                {room.eventPriorityRules.map((rule, index) => (
                                                    <div className="priority-rule-row" key={`${room.roomId}-${index}`}>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Tip eveniment"
                                                            value={rule.eventType}
                                                            onChange={(event) => updatePriorityRule(room.roomId, index, "eventType", event.target.value)}
                                                        />
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            step="1"
                                                            className="form-control priority-number"
                                                            placeholder="Prioritate"
                                                            value={rule.priority}
                                                            onChange={(event) => updatePriorityRule(room.roomId, index, "priority", event.target.value)}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-danger priority-remove-button"
                                                            aria-label={`Șterge regula ${rule.eventType || index + 1}`}
                                                            title="Șterge regula"
                                                            onClick={() => removePriorityRule(room.roomId, index)}
                                                            disabled={room.eventPriorityRules.length === 1}
                                                        >
                                                            X
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <button
                                                type="button"
                                                className="btn btn-outline-dark admin-add-rule"
                                                onClick={() => addPriorityRule(room.roomId)}
                                            >
                                                Adaugă tip de eveniment
                                            </button>
                                        </div>
                                    )}

                                    <div className="admin-scheduling-foot">
                                        <div>
                                            <span>Permis pentru:</span>
                                            <strong>{room.allowedAlgorithms.map(algorithm => algorithmLabels[algorithm] || algorithm).join(", ")}</strong>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-dark"
                                            disabled={savingRoomId === room.roomId}
                                            onClick={() => saveConfiguration(room)}
                                        >
                                            {savingRoomId === room.roomId ? "Se salvează..." : "Salvează"}
                                        </button>
                                    </div>
                                </section>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminScheduling;
