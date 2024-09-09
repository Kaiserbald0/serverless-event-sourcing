import { useNavigate } from '@remix-run/react';
import { useEffect, useState } from 'react';

export function useEaseIn(urlToNavigate: string) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    setOpen(true);
  }, []);

  const closePanel = () => {
    setTimeout(() => {
      return navigate(urlToNavigate);
    }, 500);
    setOpen(false);
  };

  return {
    open,
    closePanel,
  };
}
