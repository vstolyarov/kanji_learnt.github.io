#!/usr/bin/env python

import json
import getopt
import os
import sys

repo_path = os.path.realpath(os.path.join(os.path.dirname(__file__), '..'))
#sys.path.insert(0, os.path.join(repo_path)

JSON_FILE = os.path.join(repo_path, 'javascripts/kanji_learnt.json')

def get_data():
    with open(JSON_FILE, 'r'):
        data = json.load(JSON_FILE)
        return {d.kanji: {
            'kunyomi': d.kunyomi,
            'onyomi': d.onyomi,
            'english': d.english,
        } for d in data}


def save_data(data):
    with open(JSON_FILE, 'w') as f:
        json.dump(data, f, ensure_ascii=False, sort_keys=True,
            indent=4, separators=(',', ': '))


def add_kanji():
    with open(JSON_FILE, 'r') as f:
        data = json.load(f)

    kanji = ""
    while len(kanji) != 1:
        kanji = input("Enter your Kanji: ")
        if kanji in [d["kanji"] for d in data]:
            print("This kanji already exists!\n")
            kanji = ""
    onyomi = input("enter all possible onyomi, coma separated: ").split(",")
    kunyomi = input("enter all possible kunyomi, coma separated: ").split(",")
    english = input("Enter the english definition: ")


    related = {}
    for d in data:
        for kana in sum([d["onyomi"], d["kunyomi"]], []):
            if kana in sum([onyomi, kunyomi], []):
                if kana in related.keys():
                    related[kana].append(d["kanji"])
                else:
                    related[kana] = [d["kanji"], ]
    for kana in sum([onyomi, kunyomi], []):
        if kana not in related.keys():
            related[kana] = [kanji]
        else:
            related[kana].append(kanji)

    longest_kana = max([len(e) for e in related.keys()])
    print("The kanji {} will be added to the following lists:\n\n{}\n".format(
        kanji, "\n".join(["* {}{}: {}".format(
            key, "  " * (longest_kana - len(key)), ",".join(values)
        ) for key, values in related.items()])))

    confirm = ""
    while confirm not in ["y", "n"]:
        confirm = input("Are you sure? [y/n] ")
        if confirm == "n":
            sys.exit()

    data.append({
        "kanji": kanji,
        "english": english,
        "onyomi": onyomi,
        "kunyomi": kunyomi,
    })
    save_data(data)


def delete_kanji(kanji):
    data = json.load(JSON_FILE)
    import ipdb; ipdb.set_trace()


def usage():
    print("""
    kanji_learnt [options]

        -a: insert a new entry to the database"
        -d, --delete: remove an entry
    """)


if __name__ == '__main__':
    try:
        opts, args = getopt.getopt(
            sys.argv[1:],
            "had:v",
            ["help", "delete="],
        )
    except getopt.GetoptError as err:
        print(str(err))
        usage()
        sys.exit(2)
    for opt, arg in opts:
        if opt == "-a":
            add_kanji()
        elif opt in ("-d", "--delete"):
            delete_kanji(arg)
        else:
            usage()
            sys.exit()