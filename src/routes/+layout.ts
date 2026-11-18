// Disable prerendering for all pages in the app
export const prerender = false;

// Ensure this runs on the client side
export const ssr = false;

// Optional: Add a load function if needed
export const load = async () => {
  return {
    // You can return data here if needed
  };
};