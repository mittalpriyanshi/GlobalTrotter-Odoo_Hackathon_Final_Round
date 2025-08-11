import { useState } from "react";
import Navbar from "../components/Navbar";

const defaultStop = () => ({ id: crypto.randomUUID(), city: "", start: "", end: "", activities: [] });

const ItineraryBuilder = () => {
  const [stops, setStops] = useState([defaultStop()]);

  const addStop = () => setStops((s) => [...s, defaultStop()]);
  const removeStop = (id) => setStops((s) => s.filter((x) => x.id !== id));
  const updateStop = (id, patch) => setStops((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const move = (idx, dir) => {
    setStops((s) => {
      const a = [...s];
      const j = idx + dir;
      if (j < 0 || j >= a.length) return a;
      const tmp = a[idx];
      a[idx] = a[j];
      a[j] = tmp;
      return a;
    });
  };

  return (
    <div data-theme="retro">
      <Navbar />
      <div className="max-w-5xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-bold">Build Itinerary</h1>

        {stops.map((stop, idx) => (
          <div key={stop.id} className="card bg-base-100 border border-primary/20">
            <div className="card-body space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Section {idx + 1}</h2>
                <div className="flex items-center gap-2">
                  <button className="btn btn-ghost btn-sm" onClick={() => move(idx, -1)} disabled={idx === 0}>↑</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => move(idx, 1)} disabled={idx === stops.length - 1}>↓</button>
                  <button className="btn btn-error btn-sm" onClick={() => removeStop(stop.id)}>Remove</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="form-control">
                  <label className="label">City</label>
                  <input value={stop.city} onChange={(e)=>updateStop(stop.id,{city:e.target.value})} className="input input-bordered" placeholder="e.g., Jaipur" />
                </div>
                <div className="form-control">
                  <label className="label">Start Date</label>
                  <input type="date" value={stop.start} onChange={(e)=>updateStop(stop.id,{start:e.target.value})} className="input input-bordered" />
                </div>
                <div className="form-control">
                  <label className="label">End Date</label>
                  <input type="date" value={stop.end} onChange={(e)=>updateStop(stop.id,{end:e.target.value})} className="input input-bordered" />
                </div>
              </div>

              <div className="form-control">
                <label className="label">Activities</label>
                <div className="flex flex-wrap gap-2">
                  {stop.activities.map((a, i) => (
                    <span key={`${stop.id}-a-${i}`} className="badge badge-outline">{a}</span>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <input id={`inp-${stop.id}`} className="input input-bordered flex-1" placeholder="Add an activity (e.g., Red Fort tour)" />
                  <button className="btn btn-primary" onClick={()=>{
                    const el = document.getElementById(`inp-${stop.id}`);
                    const val = el.value.trim();
                    if(!val) return; updateStop(stop.id,{activities:[...stop.activities,val]}); el.value="";
                  }}>Add</button>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button className="btn btn-outline" onClick={addStop}>+ Add another Section</button>
      </div>
    </div>
  );
};

export default ItineraryBuilder;


