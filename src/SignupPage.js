import React from 'react';

export default function SignupPage() {
  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold text-center my-8">Welcome to Uber-Clean</h2>
        <form className="space-y-4 max-w-md mx-auto">
        <div className="form-control">
            <label className="label" htmlFor="name">
                <span className="label-text">Name</span>
            </label>
            <input type="text" id="name" className="input input-bordered w-full" placeholder="John Doe" />
        </div>
        <div className="form-control">
            <label className="label" htmlFor="email">
                <span className="label-text">Email</span>
            </label>
            <input type="email" id="email" className="input input-bordered w-full" placeholder="john@example.com" />
        </div>
        <div className="form-control">
            <label className="label" htmlFor="phone">
                <span className="label-text">Cell Phone Number</span>
            </label>
            <input type="tel" id="phone" className="input input-bordered w-full" placeholder="+1 234 567 8901" />
        </div>
        <div className="form-control mt-6">
            <button className="btn btn-primary mb-2">Create Account</button>
            <button className="btn btn-secondary mb-2">Log In</button>
            <button className="btn btn-accent">Continue Without Logging In</button>
        </div>
        </form>
    </div>
  );
}