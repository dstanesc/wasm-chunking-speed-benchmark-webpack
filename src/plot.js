export function trace({ lib, alg, count, bytes, values, text }) {
    return {
        x: ['Chunks', 'Speed (ms)'],
        y: values,
        type: 'bar',
        text: values.map(String),
        hovertext: text,
        textposition: 'auto',
        name: ` ${alg}, ${count} chunks, ${lib}, size ${bytes} MiB`
    };
}

export function layout(subtitle) {
    return {
        title: subtitle.toString(),
        xaxis: {
            tickangle: -45
        },
        yaxis: {
            type: 'linear',
            autorange: true
        },
        barmode: 'group'
    };
}