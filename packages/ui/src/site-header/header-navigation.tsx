"use client";

import {
  Box,
  Drawer,
  IconButton,
  Popover,
  SvgIcon,
  useMediaQuery,
  useTheme,
  type PopoverActions,
} from "@mui/material";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

interface HeaderNavigationProps {
  children: ReactNode;
  navigationLabel: string;
  menuLabels: { open: string; close: string };
}

function NavigationContent({
  children,
  navigationLabel,
  menuLabels,
  mobile,
}: HeaderNavigationProps & { mobile: boolean }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const toggle = useRef<HTMLButtonElement>(null);
  const paper = useRef<HTMLDivElement>(null);
  const position = useRef<PopoverActions>(null);
  useEffect(() => {
    if (
      mobile ||
      !open ||
      !paper.current ||
      typeof ResizeObserver === "undefined"
    )
      return;
    const observer = new ResizeObserver(() =>
      position.current?.updatePosition(),
    );
    observer.observe(paper.current);
    return () => observer.disconnect();
  }, [mobile, open]);
  const close = () => setOpen(false);
  const content = (
    <Box
      sx={{
        p: 2,
        minWidth: 0,
        overflowWrap: "anywhere",
        "& a:focus-visible, & button:focus-visible": {
          outline: "2px solid",
          outlineColor: "primary.main",
          outlineOffset: 2,
        },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
        <IconButton
          color="primary"
          aria-label={menuLabels.close}
          onClick={close}
          sx={{ minWidth: 44, minHeight: 44 }}
        >
          <SvgIcon aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </SvgIcon>
        </IconButton>
      </Box>
      <Box
        component="nav"
        id={id}
        aria-label={navigationLabel}
        onClick={(event) => {
          if ((event.target as Element).closest("a[href]")) close();
        }}
        sx={{
          minWidth: 0,
          "& ul": { flexDirection: "column", gap: 0 },
          "& a": {
            display: "flex",
            width: "100%",
            minWidth: 44,
            minHeight: 44,
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
  return (
    <>
      <IconButton
        color="primary"
        ref={toggle}
        type="button"
        aria-label={menuLabels.open}
        aria-expanded={open}
        aria-controls={id}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
        sx={{ minHeight: 44, minWidth: 44 }}
      >
        <SvgIcon aria-hidden="true">
          <path
            d="M4 6h16M4 12h16M4 18h16"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        </SvgIcon>
      </IconButton>
      {mobile ? (
        <Drawer
          anchor="right"
          open={open}
          onClose={close}
          ModalProps={{ keepMounted: true, disablePortal: true }}
          slotProps={{
            paper: {
              role: "dialog",
              "aria-modal": true,
              "aria-label": navigationLabel,
              sx: {
                width: "min(22rem, 100vw)",
                maxWidth: "100%",
                overflowY: "auto",
              },
            },
          }}
        >
          {content}
        </Drawer>
      ) : (
        <Popover
          action={position}
          open={open}
          anchorEl={toggle.current}
          onClose={close}
          keepMounted
          disablePortal
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            paper: {
              ref: paper,
              role: "dialog",
              "aria-modal": true,
              "aria-label": navigationLabel,
              sx: {
                width: "22rem",
                maxWidth: "calc(100vw - 32px)",
                maxHeight: "calc(100dvh - 32px)",
                overflowY: "auto",
              },
            },
          }}
        >
          {content}
        </Popover>
      )}
    </>
  );
}

export function HeaderNavigation(props: HeaderNavigationProps) {
  const desktop = useMediaQuery(useTheme().breakpoints.up("md"));
  return (
    <NavigationContent
      key={desktop ? "desktop" : "mobile"}
      {...props}
      mobile={!desktop}
    />
  );
}
