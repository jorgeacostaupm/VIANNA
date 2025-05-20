import { useDropzone } from "react-dropzone";

const FileDropZone = ({ accepts, setFieldValue, submitForm }) => {
    const { acceptedFiles, getInputProps, getRootProps, isDragActive } =
        useDropzone({
            accept: accepts,
            maxFiles: 1,
            maxSize: 10000000000, // 10 GB
            onDrop: (accepted) => {
                setFieldValue("fileURL", URL.createObjectURL(accepted[0]));
            },
        });

    const boxStyle = `h-[500px] w-full border-dashed ${
        isDragActive
            ? "border-3 border-violet-800"
            : "border-2 border-violet-600"
    } rounded-md mt-8`;

    return (
        <div {...getRootProps({ className: boxStyle })}>
            <input {...getInputProps()} />
            {acceptedFiles.length < 1 ? (
                <div className="flex flex-col items-center justify-center h-full">
                    <span
                        className={`material-symbols-outlined ${
                            isDragActive
                                ? "text-violet-800 scale-125"
                                : "text-violet-500"
                        } text-6xl font-bold`}
                    >
                        add
                    </span>
                    <span
                        className={`${
                            isDragActive ? "text-violet-800" : "text-violet-500"
                        } text-xl text-center px-4`}
                    >
                        Haz click o suelta el archivo a importar
                    </span>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full">
                    <span className="text-center text-2xl text-violet-600 w-[80%] break-words">
                        {acceptedFiles[0].name}
                    </span>
                </div>
            )}
        </div>
    );
};

export default FileDropZone;