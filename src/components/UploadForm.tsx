interface UploadFormProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export function UploadForm({ onFileSelected, disabled }: UploadFormProps) {
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <label className="custom-file-upload">
        <input
          type="file"
          accept="image/*"
          disabled={disabled}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onFileSelected(file);
            }
          }}
        />
        Choose File
      </label>
    </form>
  );
}
