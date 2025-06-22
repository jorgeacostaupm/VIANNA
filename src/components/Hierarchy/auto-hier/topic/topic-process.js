import { WordTokenizer, PorterStemmer, stopwords } from "natural";

async function downloadStopwords(language) {
    try {
        const url = `https://raw.githubusercontent.com/6/stopwords-json/master/dist/${language}.json`;
        const response = await fetch(url);
        if (!response.ok) {
            console.error(
                "error: worker: topic: fallo descarga palabras de parada, idioma: " +
                    language
            );
            return new Set(stopwords.words);
        }

        const data = response.json();
        if (!data.isArray()) {
            console.error(
                "error: worker: topic: formato de descarga palabras de parada inválido, idioma: " +
                    language
            );
            return new Set(stopwords.words);
        }

        return new Set(data);
    } catch (error) {
        console.error("error: worker: topic: " + error);
        return new Set(stopwords.words);
    }
}

export async function preprocess(attributes, config) {
    const stopwords = downloadStopwords(config.language);
    const stemmer = PorterStemmer();

    const corpus = [];
    const vocab = new Set();
    const total = attributes.length;

    self.postMessage({
        status: "initiate",
        file: "Preprocesado Atributos",
        name: "topic-model",
        progress: 0,
    });

    attributes.forEach((doc, i) => {
        try {
            const fullDoc = doc.name + " " + doc.desc;
            const cleanDoc = fullDoc
                .replace(/[^\w\s]|_/g, "")
                .replace(/\d+/g, "")
                .replace(/[^\x00-\x7F]/g, "");

            const tokens = new WordTokenizer().tokenize(cleanDoc);
            const filtered = tokens.filter((token) => {
                const stemmed = stemmer.stem(token.toLowerCase());
                return stemmed.length >= 3 && !stopwords.has(stemmed);
            });

            filtered.forEach((word) => {
                vocab.add(word);
            });
            corpus.push(filtered);

            self.postMessage({
                status: "progress",
                file: "Preprocesado Atributos",
                name: "topic-model",
                progress: (i / total) * 100,
            });
        } catch (error) {
            console.error("error: topic: preprocess: ", doc.name, "\terror:", error);
        }
    });

    self.postMessage({
        status: "done",
        file: "Preprocesado Atributos",
        name: "topic-model",
        progress: 100,
    });
    self.postMessage({
        status: "state",
        name: "Preprocesado Atributos",
        loaded: true,
    });
}
