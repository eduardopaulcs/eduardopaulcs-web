import { Close } from "@mui/icons-material";
import { Box, IconButton, Modal as MuiModal } from "@mui/material";
import useTranslation from "../../hooks/useTranslation";

interface ModalProps extends React.ComponentPropsWithoutRef<typeof MuiModal> {
  onClose: () => void;
  showCross?: boolean;
  closeOnBackdropClick?: boolean;
};

/**
 * Wrapper for the MUI Modal.
 *
 * @param onClose Callback fired when the component requests to be closed.
 */
const Modal = ({
  onClose,
  children,
  showCross = true,
  closeOnBackdropClick = true,
  ...otherProps
}: ModalProps) => {
  const {t} = useTranslation();

  /**
   * Handles user clicking on the backdrop.
   */
  const handleBackdropClick = () => {
    if (!closeOnBackdropClick) {
      return;
    }

    onClose();
  };

  /**
   * Handles user clicking on the proper modal.
   */
  const handleModalClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  /**
   * Handles user clicking on the close cross.
   */
  const handleCrossClick = () => {
    if (!showCross) {
      return;
    }

    onClose();
  };

  return (
    <MuiModal
      {...otherProps}
    >
      <Box
        sx={{
          position: "absolute",
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={handleBackdropClick}
      >
        <Box
          sx={{
            position: "relative",
            padding: "3rem",
            bgcolor: "secondary.dark",
            boxShadow: "0px 0px 48px 4px #000",
            maxWidth: {
              xs: "100%",
              md: "48rem",
            },
            margin: {
              xs: "0",
              sm: "2rem",
            },
          }}
          onClick={handleModalClick}
        >
          {showCross && (
            <IconButton
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                margin: "0.5rem",
              }}
              size="small"
              onClick={handleCrossClick}
              aria-label={t("modal.closeModal")}
            >
              <Close />
            </IconButton>
          )}
          {children}
        </Box>
      </Box>
    </MuiModal>
  );
};

export default Modal;
